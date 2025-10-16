const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
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

const uploadAvatar = multer({ storage: storage }).single("avatar");
const uploadFeviconIcon = multer({ storage: storage }).single("fevicon");
const uploadLogo = multer({ storage: storage }).single("logo");

module.exports ={ uploadAvatar,uploadFeviconIcon,uploadLogo};
