const File = require("../models/File");
const fs = require("fs");

// ================= UPLOAD =================
exports.uploadFile = async (req, res) => {
  try {
    await File.create({
      userId: req.session.userId,
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size, // ⭐ save size
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
};

// ================= DOWNLOAD =================
exports.downloadFile = async (req, res) => {
  const file = await File.findById(req.params.id);
  res.download(file.path, file.originalname);
};

// ================= DELETE =================
exports.deleteFile = async (req, res) => {
  const file = await File.findById(req.params.id);

  fs.unlinkSync(file.path);
  await file.deleteOne();

  res.redirect("/dashboard");
};

// ================= RENAME ⭐ NEW =================
exports.renameFile = async (req, res) => {
  const { newName } = req.body;

  await File.findByIdAndUpdate(req.params.id, {
    originalname: newName,
  });

  res.redirect("/dashboard");
};