const snap7 = require('node-snap7');
const plc = new snap7.S7Client();
const bitMapping = require("./bitMapping");

// Thông tin kết nối PLC
const PLC_IP = "192.168.0.1"; // Cập nhật IP của PLC
const RACK = 0;
const SLOT = 1;

async function connectToPLC() {
    return new Promise((resolve, reject) => {
        plc.ConnectTo(PLC_IP, RACK, SLOT, (err) => {
            if (err) {
                console.error("❌ Không thể kết nối PLC:", plc.ErrorText(err));
                reject(new Error("Không thể kết nối PLC"));
            } else {
                console.log("✅ Kết nối PLC thành công!");
                resolve();
            }
        });
    });
}


// Đọc dữ liệu từ PLC
// Đọc dữ liệu từ PLC
async function readPLC() {
    return new Promise((resolve, reject) => {
        plc.ReadArea(plc.S7AreaDB, 2, 0, 1, plc.S7WLByte, (err, data) => {
            if (err) {
                console.error("❌ Lỗi đọc dữ liệu từ PLC:", plc.ErrorText(err));
                reject(err);
            } else {
                console.log("📡 Dữ liệu PLC nhận được:", data);

                let byte0 = data[0];
                let Motor1_Btn = (byte0 & 0x01) !== 0;  // Bit 0.0
                let Motor2_Btn = (byte0 & 0x02) !== 0;  // Bit 0.1
                let Mode_Btn = (byte0 & 0x02) !== 0;  // Bit 0.1

                console.log(`🔹 Motor1_Btn: ${Motor1_Btn}, Motor2_Btn: ${Motor2_Btn},Mode_Btn:${Mode_Btn}`);
                resolve({ Motor1_Btn, Motor2_Btn, Mode_Btn});
            }
        });
    });
}


// Ghi dữ liệu vào PLC
async function writePLC(device, state) {
    return new Promise((resolve, reject) => {
        const bitPosition = bitMapping[device]; // Lấy vị trí bit từ file mapping
        if (bitPosition === undefined) {
            return reject(new Error(`❌ Thiết bị "${device}" không hợp lệ!`));
        }

        plc.ReadArea(plc.S7AreaDB, 2, 0, 1, plc.S7WLByte, (err, data) => {
            if (err) {
                console.error("❌ Lỗi đọc dữ liệu từ PLC trước khi ghi:", plc.ErrorText(err));
                return reject(err);
            }

            let byte0 = data[0];

            if (state) {
                byte0 |= (1 << bitPosition); // Bật bit
            } else {
                byte0 &= ~(1 << bitPosition); // Tắt bit
            }

            let buffer = Buffer.alloc(1);
            buffer[0] = byte0;

            plc.WriteArea(plc.S7AreaDB, 2, 0, 1, plc.S7WLByte, buffer, (err) => {
                if (err) {
                    console.error("❌ Lỗi ghi dữ liệu vào PLC:", plc.ErrorText(err));
                    return reject(err);
                }
                console.log(`✅ Ghi thành công! Giá trị Byte: ${byte0.toString(2).padStart(8, "0")}`);
                resolve();
            });
        });
    });
}

module.exports = { connectToPLC, readPLC, writePLC };
