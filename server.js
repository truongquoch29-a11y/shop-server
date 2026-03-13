const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()
app.use(cors())
app.use(express.json())

// SUPABASE
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)


// TẠO TÀI KHOẢN
app.post("/register", async (req, res) => {

    const { username, password } = req.body

    const { data: userExist } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single()

    if (userExist) {
        return res.json({ status: "exist" })
    }

    const { error } = await supabase
        .from("users")
        .insert([
            {
                username: username,
                password: password,
                balance: 0
            }
        ])

    if (error) {
        return res.json({ status: "error" })
    }

    res.json({ status: "success" })
})


// ĐĂNG NHẬP
app.post("/login", async (req, res) => {

    const { username, password } = req.body

    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single()

    if (!data) {
        return res.json({ status: "fail" })
    }

    res.json({
        status: "success",
        user: data
    })
})


// LẤY SỐ DƯ
app.get("/balance/:username", async (req, res) => {

    const username = req.params.username

    const { data } = await supabase
        .from("users")
        .select("balance")
        .eq("username", username)
        .single()

    res.json(data)
})


// ADMIN CỘNG TIỀN
app.post("/add-money", async (req, res) => {

    const { username, amount } = req.body

    const { data } = await supabase
        .from("users")
        .select("balance")
        .eq("username", username)
        .single()

    const newBalance = data.balance + amount

    await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("username", username)

    res.json({ status: "success", balance: newBalance })
})


app.listen(3000, () => {
    console.log("Server running")
})
