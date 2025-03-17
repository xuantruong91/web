const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const nodemailer = require('nodemailer');
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

router.get('/data', async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM control_EC_pH ORDER BY id DESC');
        res.json({ data: rows, timestamp: new Date().getTime() }); // Thêm timestamp để tránh cache
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ MySQL:", error);
        res.status(500).json({ error: "Lỗi khi lấy dữ liệu từ MySQL" });
    }
});

router.post('/send-email', async (req, res) => {
    try {
        const { email, data } = req.body;

        if (!email || !data.length) {
            return res.status(400).json({ message: "Thiếu email hoặc dữ liệu rỗng" });
        }

        // Tạo thư mục temp nếu chưa tồn tại
        const tempDir = path.join(__dirname, "../temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Tạo Workbook và Worksheet từ dữ liệu
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([["ID", "Time", "Nồng độ EC", "Nồng độ pH"], ...data]);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Lưu file Excel tạm thời
        const filePath = path.join(__dirname, "../temp/data.xlsx");
        XLSX.writeFile(wb, filePath);

        // Cấu hình Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'truong.nguyensinhvienbk91@hcmut.edu.vn',  // Email của bạn
                pass: 'bnwa bzty vsci giaz'       // Mật khẩu ứng dụng (App Password)
            }
        });

        let mailOptions = {
            from: 'truong.nguyensinhvienbk91@hcmut.edu.vn',
            to: email,
            subject: 'Dữ liệu từ hệ thống',
            text: "Dữ liệu từ hệ thống được đính kèm trong file Excel.",
            attachments: [
                {
                    filename: "data.xlsx",
                    path: filePath
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        // Xóa file sau khi gửi để không bị đầy bộ nhớ
        fs.unlinkSync(filePath);

        res.json({ message: "📧 Email đã gửi thành công với file đính kèm!" });

    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
        res.status(500).json({ message: "Lỗi khi gửi email" });
    }
});

router.post('/api/clear-data', async (req, res) => {
    try {
        await db.query("DELETE FROM control_EC_pH"); // Xóa toàn bộ dữ liệu
        res.json({ success: true, message: "Dữ liệu đã bị xóa!" });
    } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa dữ liệu!" });
    }
});


module.exports = router;
