const multer = require("multer");
const path = require("path");

// Use memory storage to hold the file as a buffer in memory
const storage = multer.memoryStorage();

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: File upload only supports the following filetypes - " + allowedTypes));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit, well under the 16MB MongoDB document limit
  fileFilter: fileFilter,
});

module.exports = upload;
