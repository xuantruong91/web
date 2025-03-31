const snap7 = require("node-snap7");

class SiemensPLC {
    constructor(ip, rack = 0, slot = 1) {
        this.client = new snap7.S7Client();
        this.ip = ip;
        this.rack = rack;
        this.slot = slot;
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.client.ConnectTo(this.ip, this.rack, this.slot)) {
                console.log(`✅ Kết nối thành công với PLC Siemens tại ${this.ip}`);
                resolve();
            } else {
                reject(`❌ Lỗi kết nối PLC: ${this.client.LastErrorText()}`);
            }
        });
    }

    readTag(dbNumber, start, size) {
        return new Promise((resolve, reject) => {
            this.client.DBRead(dbNumber, start, size, (err, buffer) => {
                if (err) {
                    reject(`❌ Lỗi đọc dữ liệu từ PLC: ${this.client.LastErrorText()}`);
                } else {
                    resolve(buffer.readFloatLE(0)); // Đọc giá trị float (thay đổi tùy biến)
                }
            });
        });
    }

    disconnect() {
        this.client.Disconnect();
        console.log("🔌 Đã ngắt kết nối với PLC");
    }
}

module.exports = SiemensPLC;
