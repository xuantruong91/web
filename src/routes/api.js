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
router.post('/clear-data', async (req, res) => {
    try {
        await connection.query("DELETE FROM control_EC_pH"); // Xóa toàn bộ dữ liệu
        await connection.query("ALTER TABLE control_EC_pH AUTO_INCREMENT = 1"); // Reset ID về 1

        res.json({ success: true, message: "Dữ liệu đã bị xóa và ID đã reset về 1!" });
    } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa dữ liệu!" });
    }
});


router.post('/button-press', async (req, res) => {
    const { device, state } = req.body; // device: "motor1", "fan1", state: 0 hoặc 1

    if (!device || (state !== 0 && state !== 1)) {
        return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
    }

    try {
        // Lấy giá trị mới nhất của Nồng_độ_EC và Nồng_độ_pH
        const [latestData] = await connection.query(
            "SELECT Nồng_độ_EC, Nồng_độ_pH FROM control_EC_pH ORDER BY id DESC LIMIT 1"
        );

        let ecValue = latestData.length > 0 ? latestData[0]["Nồng_độ_EC"] : null;
        let pHValue = latestData.length > 0 ? latestData[0]["Nồng_độ_pH"] : null;

        // Chèn dữ liệu vào bảng, kèm theo Nồng_độ_EC và Nồng_độ_pH mới nhất
        await connection.query(
            "INSERT INTO control_EC_pH (device, state, Time, Nồng_độ_EC, Nồng_độ_pH) VALUES (?, ?, NOW(), ?, ?)",
            [device, state, ecValue, pHValue]
        );

        res.json({ success: true, message: `Trạng thái ${device} đã được cập nhật thành ${state}!` });
    } catch (error) {
        console.error("Lỗi khi lưu trạng thái thiết bị:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lưu trạng thái thiết bị!" });
    }
});



module.exports = router;
