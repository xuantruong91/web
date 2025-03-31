const nodes7 = require("nodes7");

const plc = new nodes7();

const PLC_CONFIG = {
    host: "192.168.0.1", // Đổi thành IP PLC của bạn
    rack: 0,
    slot: 1
};

function connectToPLC() {
    plc.initiateConnection(PLC_CONFIG, (err) => {
        if (err) {
            console.error("❌ Lỗi kết nối PLC:", err);
        } else {
            console.log("✅ Kết nối PLC thành công!");
        }
    });
}

function readPLC(tags, callback) {
    plc.setTranslationCB((tag) => tags[tag]);
    plc.readAllItems((err, values) => {
        if (err) {
            console.error("❌ Lỗi đọc dữ liệu:", err);
            callback(err, null);
        } else {
            console.log("📊 Dữ liệu từ PLC:", values);
            callback(null, values);
        }
    });
}

function writePLC(data, callback) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    plc.writeItems(keys, values, (err) => {
        if (err) {
            console.error("❌ Lỗi ghi dữ liệu vào PLC:", err);
            callback(err);
        } else {
            console.log("✅ Đã ghi dữ liệu vào PLC:", data);
            callback(null);
        }
    });
}

module.exports = { connectToPLC, readPLC, writePLC };