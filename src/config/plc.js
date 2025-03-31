const snap7 = require('node-snap7');

// Khởi tạo PLC Client
const plc = new snap7.S7Client();

const PLC_CONFIG = {
    ip: "192.168.0.1", // Đổi IP PLC của bạn
    rack: 0,
    slot: 1
};

// Hàm kết nối đến PLC
function connectToPLC() {
    return new Promise((resolve, reject) => {
        if (plc.ConnectTo(PLC_CONFIG.ip, PLC_CONFIG.rack, PLC_CONFIG.slot)) {
            reject(`❌ Lỗi kết nối PLC: ${plc.ErrorText(plc.LastError())}`);
        } else {
            console.log("✅ Kết nối PLC thành công!");
            resolve();
        }
    });
}

// Ghi giá trị vào PLC
async function writePLC(tag, value) {
    try {
        let buffer = Buffer.alloc(1);
        buffer.writeUInt8(value ? 1 : 0, 0);

        let dbNumber = 1;
        let startByte = tag === "motor1" ? 0 : 1;

        await new Promise((resolve, reject) => {
            plc.WriteArea(snap7.S7AreaDB, dbNumber, startByte, buffer.length, buffer, (err) => {
                if (err) reject(`❌ Lỗi ghi PLC: ${plc.ErrorText(err)}`);
                else resolve(`✅ Đã ghi giá trị ${value} vào ${tag} trong PLC.`);
            });
        });

    } catch (error) {
        console.error(error);
    }
}

// Export module
module.exports = { connectToPLC, writePLC };
