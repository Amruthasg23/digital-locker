const express = require("express");
const router = express.Router();

const {
  getLogin,
  getRegister,
  loginUser,
  registerUser,
  logoutUser,
} = require("../controllers/authController");

router.get("/login", getLogin);
router.post("/login", loginUser);

router.get("/register", getRegister);
router.post("/register", registerUser);

router.get("/logout", logoutUser);

module.exports = router;