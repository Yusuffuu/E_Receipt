const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = './uploads';
const idImagesDir = './uploads/id_images';
const agreementsDir = './uploads/agreements';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(idImagesDir)) fs.mkdirSync(idImagesDir);
if (!fs.existsSync(agreementsDir)) fs.mkdirSync(agreementsDir);

// Configure storage for ID images
const idStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/id_images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `id_${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg and .png files are allowed'));
  }
};

const uploadID = multer({
  storage: idStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = { uploadID };