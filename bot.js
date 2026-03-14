const { createClient } = require("@supabase/supabase-js")
const Tesseract = require("tesseract.js")
const fs = require("fs")

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
)

// ======================
// HÀM KIỂM TRA ẢNH
// ======================

async function checkImage(path){

const result = await Tesseract.recognize(path,"eng")

return result.data.text.toLowerCase()

}

// ======================
// BOT LOOP
// ======================

async function runBot(){

while(true){

try{

const {data:deposits} = await supabase
.from("deposits")
.select("*")
.eq("status","pending")

if(deposits){

for(const d of deposits){

if(!d.image_path) continue

const text = await checkImage(d.image_path)

// kiểm tra VCB

const isVCB =
text.includes("vietcombank") ||
text.includes("vcb") ||
text.includes("digibank")

if(!isVCB) continue

// kiểm tra nội dung

if(!text.includes(d.content.toLowerCase())) continue

// kiểm tra số tiền

if(!text.includes(String(d.amount))) continue

// kiểm tra thời gian ±2 phút

const time = new Date(d.created_at).getTime()

if(Math.abs(Date.now()-time) > 120000) continue

// cộng tiền

const {data:user} = await supabase
.from("users")
.select("balance")
.eq("username",d.username)
.single()

const newBalance = Number(user.balance)+Number(d.amount)

await supabase
.from("users")
.update({balance:newBalance})
.eq("username",d.username)

// cập nhật trạng thái

await supabase
.from("deposits")
.update({status:"success"})
.eq("id",d.id)

fs.unlinkSync(d.image_path)

}

}

}catch{}

await new Promise(r=>setTimeout(r,20000))

}

}

runBot()
