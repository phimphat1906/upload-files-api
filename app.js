const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });


// ======================================
// 1. Upload ไฟล์เดียว
// POST /api/files
// ======================================
app.post("/api/files", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "กรุณาเลือกไฟล์"
        });
    }

    res.json({
        message: "Upload สำเร็จ",
        file: req.file
    });
});


// ======================================
// 2. Upload หลายไฟล์
// POST /api/files/multiple
// ======================================
app.post("/api/files/multiple", upload.array("files", 10), (req, res) => {

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: "กรุณาเลือกไฟล์"
        });
    }

    res.json({
        message: "Upload หลายไฟล์สำเร็จ",
        files: req.files
    });
});


// ======================================
// 3. ดูรายชื่อไฟล์ทั้งหมด
// GET /api/files/multiple
// ======================================
app.get("/api/files/multiple", (req, res) => {

    fs.readdir(uploadDir, (err, files) => {

        if (err) {
            return res.status(500).json({
                message: "ไม่สามารถอ่านไฟล์ได้"
            });
        }

        res.json({
            files: files
        });
    });
});


// ======================================
// 4. Download ไฟล์
// GET /api/files/:filename
// ======================================
app.get("/api/files/:filename", (req, res) => {

    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "ไม่พบไฟล์"
        });
    }

    res.download(filePath, filename);
});


// ======================================
// 5. Delete ไฟล์
// DELETE /api/files/:filename
// ======================================
app.delete("/api/files/:filename", (req, res) => {

    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "ไม่พบไฟล์"
        });
    }

    fs.unlink(filePath, (err) => {

        if (err) {
            return res.status(500).json({
                message: "ไม่สามารถลบไฟล์ได้"
            });
        }

        res.json({
            message: "ลบไฟล์สำเร็จ",
            filename: filename
        });
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});