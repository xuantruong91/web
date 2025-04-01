const { readPLC } = require("../config/plc");

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("🔗 Client connected:", socket.id);

        const interval = setInterval(async () => {
            try {
                console.log("📢 Gửi dữ liệu PLC qua socket...");
                const plcData = await readPLC();
                console.log("📡 Dữ liệu PLC gửi đi:", plcData);
                socket.emit("plc-data", plcData);
            } catch (error) {
                console.error("❌ Lỗi khi đọc PLC:", error);
            }
        }, 2000);

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
            clearInterval(interval);
        });
    });
};
