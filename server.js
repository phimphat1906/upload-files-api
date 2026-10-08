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

// กำหนดวิธีเก็บไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage
});

// ให้เข้าถึงไฟล์ใน uploads ได้
app.use("/uploads", express.static(uploadDir));


// ========================================
// 1. Upload ไฟล์เดียว
// POST /api/files
// ========================================

app.post("/api/files", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "กรุณาเลือกไฟล์"
        });
    }

    res.status(201).json({
        message: "อัปโหลดไฟล์สำเร็จ",
        file: {
            originalName: req.file.originalname,
            fileName: req.file.filename,
            size: req.file.size,
            path: `/uploads/${req.file.filename}`
        }
    });
});


// ========================================
// 2. Upload หลายไฟล์
// POST /api/files/multiple
// ========================================

app.post(
    "/api/files/multiple",
    upload.array("files", 10),
    (req, res) => {

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "กรุณาเลือกไฟล์"
            });
        }

        const files = req.files.map(file => ({
            originalName: file.originalname,
            fileName: file.filename,
            size: file.size,
            path: `/uploads/${file.filename}`
        }));

        res.status(201).json({
            message: "อัปโหลดหลายไฟล์สำเร็จ",
            files: files
        });
    }
);


// ========================================
// 3. ดูรายชื่อไฟล์รูปภาพ
// GET /api/files/multiple
// ========================================

app.get("/api/files/multiple", (req, res) => {

    const files = fs.readdirSync(uploadDir);

    const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp"
    ];

    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });

    res.json({
        count: imageFiles.length,
        files: imageFiles
    });
});


// ========================================
// 4. ดาวน์โหลดไฟล์
// GET /api/files/:filename
// ========================================

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


// ========================================
// 5. ลบไฟล์
// DELETE /api/files/:filename
// ========================================

app.delete("/api/files/:filename", (req, res) => {

    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "ไม่พบไฟล์"
        });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
        message: "ลบไฟล์สำเร็จ",
        fileName: filename
    });
});


// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});