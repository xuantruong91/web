const WebSocket = require('ws');
const { readPLC } = require('../config/plc');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    async function broadcastPLCStatus() {
        try {
            const data = await readPLC(2,0,2);
            const data1 = await readPLC(5,0,2);
            const message = JSON.stringify({
                type: 'status',
                data: data ,
                data1: data1
            });

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (error) {
            console.error('Lỗi khi gửi dữ liệu PLC:', error);
        }
    }

    // Cập nhật trạng thái PLC liên tục mỗi 1 giây
    setInterval(broadcastPLCStatus, 1000);

    wss.on('connection', (ws) => {
        console.log('🔗 Client WebSocket connected');
        broadcastPLCStatus(); // Gửi ngay dữ liệu khi client kết nối
    });
}

module.exports = setupWebSocket;
