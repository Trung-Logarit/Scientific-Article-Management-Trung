const express = require("express"); // Import Express
const app = require("./app.js"); // Import ứng dụng chính
const dotenv = require("dotenv"); // Đọc biến môi trường
const fs = require("fs"); // Hệ thống file
const path = require("path"); // Xử lý đường dẫn
const http = require("http"); // HTTP server
const mongoose = require("mongoose"); // Kết nối MongoDB
const { Server } = require("socket.io"); // Socket.IO
const socketServer = require("./socketServer.js");

// Cấu hình dotenv
dotenv.config();

// Lấy PORT
const port = process.env.PORT || 8080;

// Middleware phục vụ file tĩnh từ "public/files"
app.use('/files', express.static(path.join(__dirname, 'public/files')));

// Route API trả về danh sách file trong "public/files"
app.get('/api/files', (req, res) => {
  const filesPath = path.join(__dirname, 'public/files');
  fs.readdir(filesPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi khi đọc file", error: err });
    }
    res.json({ files }); // Trả về danh sách file JSON
  });
});

// Tạo HTTP server và tích hợp ứng dụng
const httpServer = http.createServer(app);

// Kết nối cơ sở dữ liệu MongoDB
mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Kết nối cơ sở dữ liệu thành công!"));

// Tích hợp Socket.IO
const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("Client kết nối:", socket.id);
  socketServer(socket, io);
});

// Khởi động server
httpServer.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}/`);
});
