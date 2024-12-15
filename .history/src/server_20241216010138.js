const app = require("./app.js"); // Import ứng dụng chính
const dotenv = require("dotenv"); // Đọc biến môi trường từ file .env
const fs = require("fs"); // Làm việc với hệ thống tệp
const http = require("http"); // Tạo HTTP server
const path = require("path"); // Xử lý đường dẫn
const mongoose = require("mongoose"); // Kết nối MongoDB
const { Server } = require("socket.io"); // Socket.IO cho giao tiếp thời gian thực
const socketServer = require("./socketServer.js"); // Xử lý socket server

// Cấu hình dotenv để sử dụng biến môi trường
dotenv.config();

// Lấy cổng từ biến môi trường hoặc sử dụng giá trị mặc định là 8080
const port = process.env.PORT || 8080;

// Cấu hình phục vụ file tĩnh từ thư mục 'public/files'
app.use('/files', express.static(path.join(__dirname, 'public/files')));

// Tạo HTTP server và tích hợp ứng dụng chính
const httpServer = http.createServer(app);

// Kết nối cơ sở dữ liệu MongoDB
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Kết nối cơ sở dữ liệu thành công!");
  })
  .catch((err) => {
    console.error("Lỗi kết nối cơ sở dữ liệu:", err);
  });

// Tích hợp Socket.IO cho giao tiếp thời gian thực
const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("Client kết nối:", socket.id);
  socketServer(socket, io); // Xử lý các sự kiện từ socket
});

// API trả về danh sách file trong thư mục 'public/files'
app.get('/api/files', (req, res) => {
  const filesPath = path.join(__dirname, 'public/files');

  fs.readdir(filesPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi khi đọc file', error: err });
    }
    res.json({ files }); // Trả về danh sách file dưới dạng JSON
  });
});

// Khởi động server
httpServer.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}/`);
});
