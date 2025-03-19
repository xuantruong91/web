const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

// Kết nối đến WinCC Runtime đóng vai trò Modbus Server
const connectModbus = async () => {
    if (!client.isOpen) {
        await client.connectTCP('192.168.0.1', { port: 502 });  // IP WinCC, Port mặc định 502
        client.setID(1); // Slave ID bên WinCC
    }
};

// Ghi giá trị ON/OFF vào tag motor1_state (Holding Register 400001 => address 0)
const writeMotorState = async (state) => {
    try {
        await connectModbus();
        const value = state === 1 ? 1 : 0; // Đảm bảo chỉ ghi 0 hoặc 1
        await client.writeRegister(0, value); // Address 0 tương đương 4x400001
        console.log(`✅ Ghi trạng thái Motor1: ${value}`);
    } catch (err) {
        console.error("❌ Lỗi ghi Modbus:", err);
    }
};

// Đọc giá trị motor1_state từ Holding Register
const readMotorState = async () => {
    try {
        await connectModbus();
        const data = await client.readHoldingRegisters(0, 1); // Đọc 1 thanh ghi từ địa chỉ 0
        console.log(`✅ Đọc trạng thái Motor1: ${data.data[0]}`);
        return data.data[0];
    } catch (err) {
        console.error("❌ Lỗi đọc Modbus:", err);
        return null;
    }
};

module.exports = {
    writeMotorState,
    readMotorState
};
