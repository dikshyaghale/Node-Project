const express = require("express");

const mongoose = require("mongoose");
const multer = require("multer");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");

let port = process.env.PORT || 8080;

const errorController = require("./controllers/Error/error");
const adminRoutes = require("./routes/admin/admin");
const authRoutes = require("./routes/auth/auth");
const postRoute = require("./routes/Post/post");

const User = require("./models/User");

const MONGODB_URI =
  "mongodb+srv://ams:admin@cluster0.f2a7x.mongodb.net/db?retryWrites=true&w=majority";
//note: remove <> and then include ur username and password

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfprotection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfprotection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(postRoute);
app.use("/admin", adminRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);

app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("Error/500", {
    pageTitle: "Error!",
    path: "/500",
  });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("Connected To Database");
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
