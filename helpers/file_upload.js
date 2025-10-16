const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|csv|docx|xlsx)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(null, true);
  },
  // filename
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}.${ext[ext.length - 1]}`);
  },
});

const upload = multer({ storage: storage }, {limits: { fileSize: 1000 * 1024 * 1024 }} // 100MB limit
).array("files");

module.exports = upload;
