const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()
app.use(cors())
app.use(express.json())

// ======================
// SUPABASE
// ======================

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)


// ======================
// ADMIN LOGIN
// ======================

app.post("/admin/login", (req,res)=>{

const { password } = req.body

if(password === process.env.ADMIN_PASSWORD){
return res.json({success:true})
}

res.json({success:false})

})


// ======================
// TẠO TÀI KHOẢN
// ======================

app.post("/register", async (req, res) => {

const { username, password } = req.body

if(!username || !password){
return res.json({ status: "error" })
}

const { data: userExist } = await supabase
.from("users")
.select("username")
.eq("username", username)
.maybeSingle()

if (userExist) {
return res.json({ status: "exist" })
}

const { error } = await supabase
.from("users")
.insert([
{
username: username,
password: password,
balance: 0,
history: [],
created_at: new Date()
}
])

if (error) {
return res.json({ status: "error" })
}

res.json({ status: "success" })

})


// ======================
// ĐĂNG NHẬP
// ======================

app.post("/login", async (req, res) => {

const { username, password } = req.body

const { data } = await supabase
.from("users")
.select("*")
.eq("username", username)
.eq("password", password)
.maybeSingle()

if (!data) {
return res.json({ status: "fail" })
}

res.json({
status: "success",
user: data
})

})


// ======================
// LẤY SỐ DƯ
// ======================

app.get("/balance/:username", async (req, res) => {

const username = req.params.username

const { data } = await supabase
.from("users")
.select("balance")
.eq("username", username)
.maybeSingle()

res.json(data)

})


// ======================
// ADMIN LẤY DANH SÁCH USER
// ======================

app.get("/admin/users", async (req,res)=>{

const { data } = await supabase
.from("users")
.select("username")

res.json(data)

})


// ======================
// ADMIN XEM CHI TIẾT USER
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
// ADMIN CỘNG TIỀN
// ======================

app.post("/admin/add-money", async (req, res) => {

const { username, amount } = req.body

const { data } = await supabase
.from("users")
.select("balance")
.eq("username", username)
.maybeSingle()

if(!data){
return res.json({status:"fail"})
}

const newBalance = Number(data.balance) + Number(amount)

await supabase
.from("users")
.update({ balance: newBalance })
.eq("username", username)

res.json({ status: "success", balance: newBalance })

})


// ======================
// ADMIN ĐỔI MẬT KHẨU
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
// ADMIN XOÁ USER
// ======================

app.post("/admin/delete-user", async (req,res)=>{

const { username } = req.body

await supabase
.from("users")
.delete()
.eq("username",username)

res.json({status:"deleted"})

})


// ======================
// SERVER
// ======================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
app.post("/register", async (req, res) => {

const { username, password } = req.body

if(!username || !password){
return res.json({ status: "error" })
}

const { data: userExist } = await supabase
.from("users")
.select("username")
.eq("username", username)
.maybeSingle()

if (userExist) {
return res.json({ status: "exist" })
}

const { error } = await supabase
.from("users")
.insert([
{
username: username,
password: password,
balance: 0,
history: [],
created_at: new Date()
}
])

if (error) {
return res.json({ status: "error" })
}

res.json({ status: "success" })

})



// ======================
// ĐĂNG NHẬP
// ======================

app.post("/login", async (req, res) => {

const { username, password } = req.body

const { data } = await supabase
.from("users")
.select("*")
.eq("username", username)
.eq("password", password)
.maybeSingle()

if (!data) {
return res.json({ status: "fail" })
}

res.json({
status: "success",
user: data
})

})



// ======================
// LẤY SỐ DƯ
// ======================

app.get("/balance/:username", async (req, res) => {

const username = req.params.username

const { data } = await supabase
.from("users")
.select("balance")
.eq("username", username)
.maybeSingle()

res.json(data)

})



// ======================
// ADMIN LẤY DANH SÁCH USER
// ======================

app.get("/admin/users", async (req,res)=>{

const { data } = await supabase
.from("users")
.select("username")

res.json(data)

})



// ======================
// ADMIN XEM CHI TIẾT USER
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
// ADMIN CỘNG TIỀN
// ======================

app.post("/admin/add-money", async (req, res) => {

const { username, amount } = req.body

const { data } = await supabase
.from("users")
.select("balance")
.eq("username", username)
.maybeSingle()

if(!data){
return res.json({status:"fail"})
}

const newBalance = Number(data.balance) + Number(amount)

await supabase
.from("users")
.update({ balance: newBalance })
.eq("username", username)

res.json({ status: "success", balance: newBalance })

})



// ======================
// ADMIN ĐỔI MẬT KHẨU
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
// ADMIN XOÁ USER
// ======================

app.post("/admin/delete-user", async (req,res)=>{

const { username } = req.body

await supabase
.from("users")
.delete()
.eq("username",username)

res.json({status:"deleted"})

})

const { error } = await supabase
.from("users")
.insert([
{
username,
password,
balance:0,
history:[],
created_at:new Date()
}
])

if(error){
console.log(error)
return res.json({status:"error"})
}

// ======================
// SERVER
// ======================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
