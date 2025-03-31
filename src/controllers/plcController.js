const SiemensPLC = require("../services/plc");
const plc = new SiemensPLC("192.168.0.1");

exports.connectPLC = async (req, res) => {
    try {
        await plc.connect();
        res.send("✅ Đã kết nối PLC Siemens!");
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.readTag = async (req, res) => {
    try {
        const value = await plc.readTag(1, 0, 4); // Đọc DB1, Offset 0, 4 bytes (FLOAT)
        res.send(`📡 Giá trị đọc được: ${value}`);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.disconnectPLC = (req, res) => {
    plc.disconnect();
    res.send("🔌 Đã ngắt kết nối PLC!");
};
