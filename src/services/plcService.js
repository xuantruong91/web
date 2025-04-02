const { connectToPLC, readPLC, writePLC } = require("..config/plc");

// Biến lưu trạng thái hiện tại
let plcData = { Motor1_Btn: false, Motor2_Btn: false, Mode_Btn:false,Fan_thong_gio_Btn:false,Fan_hut_nhiet_Btn:false,Mixer_Btn:false,Đèn_sưởi_Btn:false };

// Kết nối PLC ban đầu
async function initializePLC() {
    try {
        await connectToPLC();
        console.log("🔄 Bắt đầu đọc dữ liệu từ PLC...");
        setInterval(updatePLCData, 2000); // Cập nhật mỗi 2 giây
    } catch (error) {
        console.error("⚠️ Lỗi khi kết nối PLC: ", error);
    }
}

// Cập nhật dữ liệu từ PLC
async function updatePLCData() {
    try {
        plcData = await readPLC();
        console.log("📥 Dữ liệu PLC:", plcData);
    } catch (error) {
        console.error("❌ Lỗi đọc PLC: ", error);
    }
}



module.exports = { initializePLC, updatePLCData,plcData };
