const User = require("../models/User");


// ================= REGISTER PAGE =================
exports.getRegister = (req, res) => {
  res.render("auth/register", { error: null });
};


// ================= LOGIN PAGE =================
exports.getLogin = (req, res) => {
  res.render("auth/login", { error: null });
};


// ================= REGISTER USER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.render("auth/register", { error: "User already exists" });
    }

    // ✅ plain password → model hashes
    await User.create({
      name,
      email,
      password,
    });

    res.redirect("/login");

  } catch (err) {
    console.log("REGISTER ERROR =>", err);
    res.send(err.message);
  }
};


// ================= LOGIN USER =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.render("auth/login", { error: "User not found" });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      return res.render("auth/login", { error: "Wrong password" });
    }

    req.session.userId = user._id;

    res.redirect("/dashboard");

  } catch (err) {
    console.log(err);
    res.render("auth/login", { error: "Login failed" });
  }
};


// ================= LOGOUT =================
exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};