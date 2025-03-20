
const WebSocket = require('ws');

async function writeMotorState(state) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:8080'); // IP máy chạy modbus-ws-gateway.js
        ws.on('open', () => {
            ws.send(JSON.stringify({ 
                command: 'write', 
                address: 0, 
                value: Number(state) // Chuyển thành số nguyên
            }));
        });

        ws.on('message', (msg) => {
            console.log('📩 Phản hồi từ Gateway:', msg);
            ws.close();
            resolve();
        });

        ws.on('error', (err) => {
            console.error('❌ WS Error:', err);
            reject(err);
        });
    });
}


module.exports = { writeMotorState };