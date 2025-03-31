require('dotenv').config()
const webRoutes = require('./routes/web')
const configViewEngine = require('./config/viewEngine')
const express = require('express')
const connection = require('./config/database')
const app = express()
const port = process.env.PORT || 3000
const hostname = process.env.HOST_NAME;
const path = require('path')
const cors = require('cors');
app.use(cors());
const snap7 = require('node-snap7');

// Khởi tạo kết nối với PLC
const plc = new snap7.S7Client();

const PLC_CONFIG = {
    ip: "192.168.0.1", 
    rack: 0,
    slot: 1
};

// Kết nối đến PLC
function connectToPLC() {
    if (!plc.ConnectTo(PLC_CONFIG.ip, PLC_CONFIG.rack, PLC_CONFIG.slot)) {
        console.log("✅ Kết nối PLC thành công!");
    } else {
        console.error("❌ Lỗi kết nối PLC:", plc.ErrorText(plc.LastError()));
    }
}





//config req.body(lấy thông tin nhập từ html về)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//mysql
// connection.query(
//   'select * from person',
//   function (err, results) {
//     console.log(results)
//   }

// )

// connection.connect(err => {
//   if (err) {
//     console.error("Lỗi kết nối MySQL:", err);
//     return;
//   }
//   console.log("✅ Kết nối MySQL thành công!");
// });


//config template engine(luư template vào /view)
configViewEngine(app)
app.use("/template", express.static(path.join(__dirname, "template")));

const apiRoutes = require('./routes/api'); // Import file API
app.use('/api', apiRoutes); // Định nghĩa đường dẫn API
//routes
app.use(webRoutes)





app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
