const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const { readPLC, writePLC } = require("../config/plc");
const nodemailer = require('nodemailer');
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");



// 🟢 Lấy dữ liệu từ MySQL
router.get('/data', async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM control_EC_pH ORDER BY id DESC');
        res.json({ data: rows, timestamp: new Date().getTime() }); // Tránh cache
    } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu từ MySQL:", error);
        res.status(500).json({ error: "Lỗi khi lấy dữ liệu từ MySQL" });
    }
});

// 🟢 Xử lý gửi email với file Excel đính kèm
router.post('/send-email', async (req, res) => {
    try {
        const { email, data } = req.body;

        if (!email || !data.length) {
            return res.status(400).json({ message: "Thiếu email hoặc dữ liệu rỗng" });
        }

        const tempDir = path.join(__dirname, "../temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([["ID", "Time", "Nồng độ EC", "Nồng độ pH"], ...data]);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const filePath = path.join(__dirname, "../temp/data.xlsx");
        XLSX.writeFile(wb, filePath);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'truong.nguyensinhvienbk91@hcmut.edu.vn',
                pass: 'bnwa bzty vsci giaz'
            }
        });

        let mailOptions = {
            from: 'truong.nguyensinhvienbk91@hcmut.edu.vn',
            to: email,
            subject: 'Dữ liệu từ hệ thống',
            text: "Dữ liệu từ hệ thống được đính kèm trong file Excel.",
            attachments: [{ filename: "data.xlsx", path: filePath }]
        };

        await transporter.sendMail(mailOptions);

        fs.unlinkSync(filePath);

        res.json({ message: "📧 Email đã gửi thành công với file đính kèm!" });

    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
        res.status(500).json({ message: "Lỗi khi gửi email" });
    }
});

// 🟢 Xóa toàn bộ dữ liệu và reset ID
router.post('/clear-data', async (req, res) => {
    try {
        await connection.query("DELETE FROM control_EC_pH");
        await connection.query("ALTER TABLE control_EC_pH AUTO_INCREMENT = 1");

        res.json({ success: true, message: "Dữ liệu đã bị xóa và ID đã reset về 1!" });
    } catch (error) {
        console.error("❌ Lỗi khi xóa dữ liệu:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa dữ liệu!" });
    }
});

router.get('/plc-status', async (req, res) => {
    try {
        const data = await readPLC();
        console.log("📡 Dữ liệu PLC (từ API):", data);
        res.json({ success: true, data });
    } catch (error) {
        console.error("❌ Lỗi đọc PLC:", error);
        res.status(500).json({ success: false, message: "Lỗi đọc PLC" });
    }
});

router.post('/button-press', async (req, res) => {
    const { device, state } = req.body;
    try {
        const currentState = await readPLC();
        if (device === "motor1") {
            await writePLC("motor1",state);
        } else if (device === "motor2") {
            await writePLC("motor2", state);
        } else if((device === "mode")){
            await writePLC("mode", state);
        }
        res.json({ success: true, message: `${device} đã cập nhật trạng thái ${state ? "ON" : "OFF"}` });
    } catch (error) {
        console.error("Lỗi khi ghi PLC:", error);
        res.status(500).json({ success: false, message: "Lỗi khi ghi PLC!" });
    }
});


module.exports = router;