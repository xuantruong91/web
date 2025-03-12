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

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
})
