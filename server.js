const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const db = require("./db")

const app = express()

app.use(cors())
app.use(bodyParser.json())



app.post("/api/register",(req,res)=>{

 const {username,password}=req.body

 db.run(
  "INSERT INTO users(username,password) VALUES(?,?)",
  [username,password],
  function(err){

   if(err){
    console.log(err)   // in lỗi ra log
    return res.json({success:false,error:err.message})
   }

   res.json({success:true})

  }
 )

})



app.post("/api/login",(req,res)=>{

 const {username,password}=req.body

 db.get(
  "SELECT * FROM users WHERE username=? AND password=?",
  [username,password],
  (err,row)=>{

   if(!row){
    return res.json({success:false})
   }

   res.json({
    success:true,
    balance:row.balance
   })

  }
 )

})

app.get("/api/users",(req,res)=>{

db.all("SELECT * FROM users",(err,rows)=>{
res.json(rows)
})

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

 console.log("server running")

})
