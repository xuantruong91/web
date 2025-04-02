const snap7 = require('node-snap7');
const plc = new snap7.S7Client();
const bitMapping = require("./bitMapping");

// Thông tin kết nối PLC
const PLC_IP = "192.168.0.1"; // Cập nhật IP của PLC
const RACK = 0;
const SLOT = 1;

// 🛠 Hàm kết nối và đảm bảo tái kết nối nếu mất kết nối
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

// 📥 Đọc nhiều DB cùng lúc
async function readMultipleDBs() {
    try {
        if (!plc.Connected()) {
            console.error("⚠ PLC chưa kết nối! Đang thử kết nối lại...");
            await connectToPLC();
        }

        const [db2, db5] = await Promise.all([
            readPLC(2, 0, 2),  // Đọc 2 byte của DB2
            readPLC(5, 0, 2),  // Đọc 2 byte của DB5
        ]);

        return { db2, db5 };
    } catch (error) {
        console.error("❌ Lỗi khi đọc PLC:", error);
    }
}

// 📤 Hàm đọc DB từ PLC
async function readPLC(dbNumber, start, size) {
    return new Promise((resolve, reject) => {
        if (!plc.Connected()) {
            return reject(new Error("PLC chưa kết nối!"));
        }

        plc.ReadArea(plc.S7AreaDB, dbNumber, start, size, plc.S7WLByte, (err, data) => {
            if (err) {
                console.error("❌ Lỗi đọc dữ liệu từ PLC:", plc.ErrorText(err));
                reject(err);
            } else {
                console.log(`📥 Đọc DB${dbNumber} [${data.toString("hex")}]`);

                let byte0 = data[0];
                let byte1 = data.length > 1 ? data[1] : 0;

                let result = { dbNumber };

                switch (dbNumber) {
                    case 2:
                        result = {
                            ...result,
                            Motor1_Btn: !!(byte0 & 0x01),
                            Motor2_Btn: !!(byte0 & 0x02),
                            Mode_Btn: !!(byte0 & 0x04),
                            Mixer_Btn: !!(byte0 & 0x20),
                            Fan_thong_gio_Btn: !!(byte0 & 0x08),
                            Fan_hut_nhiet_Btn: !!(byte0 & 0x10),
                            Den_suoi_Btn: !!(byte0 & 0x40),
                            Emergency_Btn: !!(byte0 & 0x80),
                            Reset_Btn: !!(byte1 & 0x01),
                        };
                        break;
                    case 5:
                        result = {
                            ...result,
                            Button: !!(byte0 & 0x01),
                            Emergency: !!(byte0 & 0x02),
                            Reset: !!(byte0 & 0x04),
                            Run: !!(byte0 & 0x08),
                            Emergency_State: !!(byte0 & 0x10),
                            Reset_State: !!(byte0 & 0x20)
                        };
                        break;
                    default:
                        console.warn(`⚠ Không có cấu hình cho DB${dbNumber}`);
                }
                resolve(result);
            }
        });
    });
}

// 📝 Ghi dữ liệu vào PLC
async function writePLC(device, state) {
    return new Promise((resolve, reject) => {
        if (!plc.Connected()) {
            return reject(new Error("PLC chưa kết nối!"));
        }

        const bitPosition = bitMapping[device]; // Lấy vị trí bit từ file mapping
        if (bitPosition === undefined) {
            return reject(new Error(`❌ Thiết bị "${device}" không hợp lệ!`));
        }

        const size = 2;  // Đọc & ghi 2 byte để đảm bảo đủ dữ liệu
        plc.ReadArea(plc.S7AreaDB, 2, 0, size, plc.S7WLByte, (err, data) => {
            if (err) {
                console.error("❌ Lỗi đọc dữ liệu từ PLC trước khi ghi:", plc.ErrorText(err));
                return reject(err);
            }

            console.log(`📥 Dữ liệu trước khi ghi: ${data.toString('hex')}`);

            let byte0 = data[0];
            let byte1 = data.length > 1 ? data[1] : 0;

            // Cập nhật bit đúng byte
            if (bitPosition < 8) {
                byte0 = state ? (byte0 | (1 << bitPosition)) : (byte0 & ~(1 << bitPosition));
            } else {
                let bitInByte1 = bitPosition - 8;
                byte1 = state ? (byte1 | (1 << bitInByte1)) : (byte1 & ~(1 << bitInByte1));
            }

            let buffer = Buffer.alloc(size);
            buffer[0] = byte0;
            buffer[1] = byte1;

            console.log(`📤 Dữ liệu sau khi ghi: ${buffer.toString('hex')}`);

            plc.WriteArea(plc.S7AreaDB, 2, 0, size, plc.S7WLByte, buffer, (err) => {
                if (err) {
                    console.error("❌ Lỗi ghi dữ liệu vào PLC:", plc.ErrorText(err));
                    return reject(err);
                }
                console.log(`✅ Ghi thành công! Giá trị Byte: ${byte0.toString(2).padStart(8, "0")} ${byte1.toString(2).padStart(8, "0")}`);
                resolve();
            });
        });
    });
}

module.exports = { connectToPLC, readMultipleDBs, readPLC, writePLC };
