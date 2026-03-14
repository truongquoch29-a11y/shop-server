const Tesseract = require("tesseract.js")
const fs = require("fs")
const fetch = require("node-fetch")

const SERVER = process.env.SERVER_URL

async function verifyImage(path){

try{

const result = await Tesseract.recognize(path,"eng")

const text = result.data.text.toLowerCase()

const isVCB =
text.includes("vietcombank") ||
text.includes("vcb") ||
text.includes("digibank")

if(!isVCB){
return {status:"fail"}
}

const contentMatch = text.match(/nap_[a-z0-9_]+_[0-9]+/)

if(!contentMatch){
return {status:"fail"}
}

const content = contentMatch[0].toUpperCase()

const parts = content.split("_")
const timestamp = Number(parts[2])

const now = Date.now()

if(Math.abs(now - timestamp) > 120000){
return {status:"timeout"}
}

await fetch(SERVER+"/deposit/confirm",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({content})
})

return {status:"success"}

}catch{
return {status:"error"}
}

}

module.exports={verifyImage}
