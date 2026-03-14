const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const fs = require("fs");

dotenv.config();

const app = express();


// ================= Mongo =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error(err));


// ================= Create uploads folder =================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


// ================= View Engine =================
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");


// ================= BODY PARSER (IMPORTANT for rename/edit) =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= Static Files =================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= Session =================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);


// ================= GLOBAL USER =================
const User = require("./models/User");

app.use(async (req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.user = null;
  res.locals.currentPath = req.path;

  if (req.session.userId) {
    const user = await User.findById(req.session.userId).select("name");
    res.locals.user = user;
  }

  next();
});


// ================= Routes =================
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

app.use(authRoutes);
app.use(fileRoutes);


// ================= Home =================
app.get("/", (req, res) => {
  res.render("index");
});


// ================= Start =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);