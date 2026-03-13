const express = require("express")
const cors = require("cors")

const { createClient } = require("@supabase/supabase-js")

const app = express()

app.use(cors())
app.use(express.json())

const supabase = createClient(
 "SUPABASE_URL",
 "SUPABASE_ANON_KEY"
)

app.get("/", (req,res)=>{
 res.send("server running")
})


// REGISTER
app.post("/register", async (req,res)=>{

 const {user,pass} = req.body

 const {data:exist} = await supabase
 .from("users")
 .select("*")
 .eq("username",user)

 if(exist && exist.length>0){
  return res.json({status:"exist"})
 }

 const {error} = await supabase
 .from("users")
 .insert([
  {username:user,password:pass,balance:0}
 ])

 if(error){
  res.json({status:"error"})
 }else{
  res.json({status:"ok"})
 }

})


// LOGIN
app.post("/login", async (req,res)=>{

 const {user,pass} = req.body

 const {data} = await supabase
 .from("users")
 .select("*")
 .eq("username",user)
 .eq("password",pass)

 if(data && data.length>0){
  res.json({
   status:"ok",
   balance:data[0].balance
  })
 }else{
  res.json({status:"error"})
 }

})


// GET ALL USERS (ADMIN)
app.get("/admin/users", async (req,res)=>{

 const {data} = await supabase
 .from("users")
 .select("*")

 res.json(data)

})


// ADD MONEY
app.post("/admin/add-money", async (req,res)=>{

 const {username,amount} = req.body

 const {data} = await supabase
 .from("users")
 .select("balance")
 .eq("username",username)
 .single()

 const newBalance = data.balance + amount

 await supabase
 .from("users")
 .update({balance:newBalance})
 .eq("username",username)

 res.json({status:"ok"})

})


// DELETE USER
app.post("/admin/delete-user", async (req,res)=>{

 const {username} = req.body

 await supabase
 .from("users")
 .delete()
 .eq("username",username)

 res.json({status:"ok"})

})


app.listen(3000, ()=>{
 console.log("server running")
})
