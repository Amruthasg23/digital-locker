const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const File = require("../models/File");
const { ensureAuthenticated } = require("../middleware/authMiddleware");


// ===== Ensure uploads folder exists =====
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// ===== Multer storage =====
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// ================= DASHBOARD =================
router.get("/dashboard", ensureAuthenticated, async (req, res) => {

  try {

    const files = await File.find({ userId: req.session.userId });

    const msg = req.query.msg || null;

    res.render("dashboard", { files, msg });

  } catch (err) {
    console.log(err);
    res.redirect("/");
  }

});


// ================= UPLOAD =================
router.post(
  "/upload",
  ensureAuthenticated,
  upload.single("file"),
  async (req, res) => {

    try {

      await File.create({
        userId: req.session.userId,
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        category: req.body.category,
        expiryDate: req.body.expiryDate || null,
      });

      res.redirect("/dashboard?msg=uploaded");

    } catch (err) {
      console.log(err);
      res.redirect("/dashboard");
    }

  }
);


// ================= PREVIEW =================
router.get("/preview/:id", ensureAuthenticated, async (req, res) => {

  try {

    const file = await File.findById(req.params.id);

    if (!file) return res.redirect("/dashboard");

    const fileUrl = "/uploads/" + file.filename;

    res.render("preview", { file, fileUrl });

  } catch (err) {
    console.log(err);
    res.redirect("/dashboard");
  }

});


// ================= DOWNLOAD =================
router.get("/download/:id", ensureAuthenticated, async (req, res) => {

  try {

    const file = await File.findById(req.params.id);

    if (!file) return res.redirect("/dashboard");

    res.download(file.path, file.originalname);

  } catch (err) {
    console.log(err);
    res.redirect("/dashboard");
  }

});


// ================= DELETE =================
router.get("/delete/:id", ensureAuthenticated, async (req, res) => {

  try {

    const file = await File.findById(req.params.id);

    if (!file) return res.redirect("/dashboard");

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await file.deleteOne();

    res.redirect("/dashboard?msg=deleted");

  } catch (err) {
    console.log(err);
    res.redirect("/dashboard");
  }

});


// ================= RENAME =================
router.post("/rename/:id", ensureAuthenticated, async (req, res) => {

  try {

    const { newName } = req.body;

    await File.findByIdAndUpdate(req.params.id, {
      originalname: newName,
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }

});


// ================= EDIT CATEGORY + EXPIRY =================
router.post("/edit/:id", ensureAuthenticated, async (req, res) => {

  try {

    await File.findByIdAndUpdate(req.params.id, {
      category: req.body.category,
      expiryDate: req.body.expiryDate
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }

});


module.exports = router;