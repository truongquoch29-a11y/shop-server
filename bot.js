const Imap = require("imap")
const { simpleParser } = require("mailparser")
const fetch = require("node-fetch")

const SERVER = process.env.SERVER_URL

const imap = new Imap({
user: process.env.BOT_EMAIL,
password: process.env.BOT_PASS,
host: "imap.gmail.com",
port: 993,
tls: true
})

function openInbox(cb){
imap.openBox("INBOX", false, cb)
}

imap.once("ready", ()=>{

console.log("MAIL BOT STARTED")

openInbox((err)=>{
if(err) throw err

setInterval(checkMail,10000)

})

})

function checkMail(){

imap.search(["UNSEEN"], (err,results)=>{

if(err) return
if(!results.length) return

const f = imap.fetch(results,{ bodies:"" })

f.on("message", msg=>{

msg.on("body", stream=>{

simpleParser(stream, async (err,mail)=>{

if(err) return

const from = mail.from.text.toLowerCase()

if(
!from.includes("vietcombank") &&
!from.includes("vcb")
){
return
}

const text = mail.text || ""

const contentMatch = text.match(/NAP_[a-zA-Z0-9_]+/)

if(!contentMatch) return

const content = contentMatch[0]

console.log("Deposit detected:",content)

await fetch(SERVER+"/deposit/confirm",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({content})
})

})

})

})

})

}

imap.connect()
