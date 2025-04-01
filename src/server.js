require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require("http");
const socketIo = require("socket.io");
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');
const configViewEngine = require('./config/viewEngine');
const { connectToPLC } = require("./config/plc");


const app = express();
const port = process.env.PORT || 3000;


  //config req.body(lấy thông tin nhập từ html về)
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  configViewEngine(app);

  const server = http.createServer(app);
const io = socketIo(server);
require("./services/socket")(io);


// Kết nối PLC khi server khởi động

(async () => {
  try {
      await connectToPLC();
      console.log("🔥 Server đã sẵn sàng để giao tiếp với PLC!");
  } catch (error) {
      console.error(error);
  }
})();

app.use('/api', apiRoutes);
app.use(webRoutes);
  //config template engine(luư template vào /view)
  app.use("/template", express.static(path.join(__dirname, "template")));







  app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
