const express = require("express");
const router = express.Router();
const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");
const {
  signup,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/brandController");
const brandAuthenticationMiddleware = require("../middleware/brands/brandAuthenticationMiddleware");
const brandSignUpValidate = require("../middleware/brands/validations/brandSignUpValidate");
const brandAuthorizationMiddleware = require("../middleware/brands/brandAuthorizationMiddleware");

const store = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/brandProfiles/";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = nanoid() + path.extname(file.originalname);
    console.log(`Generated filename: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: store });
// Signup a brand
router.post("/signup", upload.single("image"), brandSignUpValidate, signup);

// Login as a brand
router.post("/login", login);

// Get brand's profile
router.get(
  "/profile",
  brandAuthenticationMiddleware,
  brandAuthorizationMiddleware,
  getProfile
);

// Update brand's profile
router.put(
  "/profile",
  brandAuthenticationMiddleware,
  brandAuthorizationMiddleware,
  updateProfile
);

module.exports = router;
