import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // Correct cb name
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Correct property
  }
});

const upload = multer({ storage });

export default upload;
