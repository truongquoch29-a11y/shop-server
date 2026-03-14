const express = require("express")
const cors = require("cors")
const fs = require("fs")
const multer = require("multer")
const Tesseract = require("tesseract.js")
const fetch = require("node-fetch")
const { createClient } = require("@supabase/supabase-js")

const app = express()

app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })

// ======================
// SUPABASE
// ======================

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
)

// ======================
// ADMIN LOGIN
// ======================

app.post("/admin/login",(req,res)=>{

const { password } = req.body

if(password === process.env.ADMIN_PASSWORD){
return res.json({success:true})
}

res.json({success:false})

})

// ======================
// REGISTER
// ======================

app.post("/register", async (req,res)=>{

const { username,password } = req.body

if(!username || !password){
return res.json({status:"error"})
}

const { data:userExist } = await supabase
.from("users")
.select("username")
.eq("username",username)
.maybeSingle()

if(userExist){
return res.json({status:"exist"})
}

const { error } = await supabase
.from("users")
.insert([{
username,
password
}])

if(error){
return res.json({status:"error"})
}

res.json({status:"success"})

})

// ======================
// LOGIN
// ======================

app.post("/login", async (req,res)=>{

const { username,password } = req.body

const { data } = await supabase
.from("users")
.select("*")
.eq("username",username)
.eq("password",password)
.maybeSingle()

if(!data){
return res.json({status:"fail"})
}

await supabase
.from("users")
.update({kicked:false})
.eq("username",username)

res.json({
status:"success",
user:data
})

})

// ======================
// USER INFO
// ======================

app.get("/user/:username", async (req,res)=>{

const { data } = await supabase
.from("users")
.select("*")
.eq("username",req.params.username)
.maybeSingle()

if(!data){
return res.json({status:"deleted"})
}

res.json(data)

})

// ======================
// BALANCE
// ======================

app.get("/balance/:username", async (req,res)=>{

const { data } = await supabase
.from("users")
.select("balance")
.eq("username",req.params.username)
.maybeSingle()

if(!data){
return res.json({balance:0})
}

res.json(data)

})

// ======================
// CREATE DEPOSIT
// ======================

app.post("/deposit", async (req,res)=>{

const { username,amount } = req.body

if(!username || !amount){
return res.json({status:"error"})
}

const content = "NAP_" + username + "_" + Date.now()

const { data,error } = await supabase
.from("deposits")
.insert([{
username,
amount,
content,
status:"pending"
}])
.select()
.single()

if(error){
return res.json({status:"error"})
}

res.json({
status:"success",
id:data.id,
content,
amount
})

})

// ======================
// DEPOSIT HISTORY
// ======================

app.get("/deposit/:username", async (req,res)=>{

const { data } = await supabase
.from("deposits")
.select("*")
.eq("username",req.params.username)
.order("created_at",{ascending:false})

res.json(data)

})

// ======================
// CONFIRM DEPOSIT
// ======================

app.post("/deposit/confirm", async (req,res)=>{

const { content } = req.body

const { data:deposit } = await supabase
.from("deposits")
.select("*")
.eq("content",content)
.maybeSingle()

if(!deposit){
return res.json({status:"fail"})
}

if(deposit.status === "success"){
return res.json({status:"done"})
}

const { data:user } = await supabase
.from("users")
.select("balance")
.eq("username",deposit.username)
.maybeSingle()

const newBalance = Number(user.balance) + Number(deposit.amount)

await supabase
.from("users")
.update({balance:newBalance})
.eq("username",deposit.username)

await supabase
.from("deposits")
.update({status:"success"})
.eq("content",content)

res.json({status:"success"})

})

// ======================
// UPLOAD BANK IMAGE
// ======================

app.post("/upload-deposit", upload.single("image"), async (req,res)=>{

try{

const path = req.file.path

const result = await Tesseract.recognize(path,"eng")

const text = result.data.text.toLowerCase()

const isVCB =
text.includes("vietcombank") ||
text.includes("vcb") ||
text.includes("digibank")

if(!isVCB){

fs.unlinkSync(path)

return res.json({
status:"fail"
})

}

const contentMatch = text.match(/nap_[a-z0-9_]+_[0-9]+/)

if(!contentMatch){

fs.unlinkSync(path)

return res.json({
status:"fail"
})

}

const content = contentMatch[0].toUpperCase()

const parts = content.split("_")
const timestamp = Number(parts[2])

const now = Date.now()

if(Math.abs(now - timestamp) > 120000){

fs.unlinkSync(path)

return res.json({
status:"timeout"
})

}

await fetch(process.env.SERVER_URL + "/deposit/confirm",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({content})
})

fs.unlinkSync(path)

res.json({status:"success"})

}catch(e){

res.json({status:"error"})

}

})

// ======================
// ADMIN USERS
// ======================

app.get("/admin/users", async (req,res)=>{

const { data } = await supabase
.from("users")
.select("username")

res.json(data)

})

// ======================
// ADMIN USER DETAIL
// ======================

app.get("/admin/user/:username", async (req,res)=>{

const { data } = await supabase
.from("users")
.select("*")
.eq("username",req.params.username)
.maybeSingle()

res.json(data)

})

// ======================
// ADMIN ADD MONEY
// ======================

app.post("/admin/add-money", async (req,res)=>{

const { username,amount } = req.body

const { data } = await supabase
.from("users")
.select("balance")
.eq("username",username)
.maybeSingle()

if(!data){
return res.json({status:"fail"})
}

const newBalance = Number(data.balance) + Number(amount)

await supabase
.from("users")
.update({balance:newBalance})
.eq("username",username)

res.json({
status:"success",
balance:newBalance
})

})

// ======================
// ADMIN CHANGE PASSWORD
// ======================

app.post("/admin/change-pass", async (req,res)=>{

const { username,password } = req.body

await supabase
.from("users")
.update({password})
.eq("username",username)

res.json({status:"ok"})

})

// ======================
// ADMIN DELETE USER
// ======================

app.post("/admin/delete-user", async (req,res)=>{

const { username } = req.body

await supabase
.from("users")
.delete()
.eq("username",username)

await supabase
.from("deposits")
.delete()
.eq("username",username)

res.json({status:"deleted"})

})

// ======================
// ADMIN KICK USER
// ======================

app.post("/admin/kick-user", async (req,res)=>{

const { username } = req.body

await supabase
.from("users")
.update({kicked:true})
.eq("username",username)

res.json({status:"kicked"})

})

// ======================
// DELETE DEPOSIT
// ======================

app.post("/delete-deposit", async (req,res)=>{

const { content } = req.body

await supabase
.from("deposits")
.delete()
.eq("content",content)

res.json({status:"deleted"})

})

// ======================
// DEPOSIT STATUS
// ======================

app.get("/deposit-status/:id", async (req,res)=>{

const { data } = await supabase
.from("deposits")
.select("status")
.eq("id",req.params.id)
.maybeSingle()

if(!data){
return res.json({status:"deleted"})
}

res.json({status:data.status})

})

// ======================
// SERVER
// ======================

app.get("/",(req,res)=>{
res.send("server online")
})

const PORT = process.env.PORT || 10000

app.listen(PORT,"0.0.0.0",()=>{
console.log("Server running on port "+PORT)
})
