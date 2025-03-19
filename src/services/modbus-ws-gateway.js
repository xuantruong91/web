const ModbusRTU = require('modbus-serial');
const WebSocket = require('ws');
const client = new ModbusRTU();

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log("✅ Web Client Connected");

    ws.on('message', async (message) => {
        try {
            const { command, address, value } = JSON.parse(message.toString());
            console.log("📩 Nhận lệnh:", message);
            console.log(`✅ Ghi Modbus thành công: Addr=${address}, Value=${value}`);


            if (command === 'write') {
                if (!client.isOpen) {
                    await client.connectTCP('192.168.0.1', { port: 502 }); // PLC / WinCC Runtime
                    client.setID(1);
                }
                await client.writeRegister(address, value);
                ws.send(JSON.stringify({ success: true, message: `✅ Đã ghi ${value} vào Address ${address}` }));
                const dataCheck = await client.readHoldingRegisters(address, 1);
                console.log(`✅ Đọc ngược lại từ WinCC - Value = ${dataCheck.data[0]}`);
            }

            if (command === 'read') {
                if (!client.isOpen) {
                    await client.connectTCP('192.168.0.1', { port: 502 });
                    client.setID(1);
                }
                const data = await client.readHoldingRegisters(address, 1);
                ws.send(JSON.stringify({ success: true, value: data.data[0] }));
            }
        } catch (err) {
            console.error("❌ Modbus Error:", err);
            ws.send(JSON.stringify({ success: false, message: 'Lỗi Modbus', error: err.message }));
        }
    });
});

console.log("✅ WebSocket Modbus Gateway đang chạy tại ws://localhost:8080");
