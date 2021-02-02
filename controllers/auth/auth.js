const nodeMailer = require("nodemailer");
const sendGridTransporter = require("nodemailer-sendgrid-transport");

const { validationResult } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const transporter = nodeMailer.createTransport(
  sendGridTransporter({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login-register", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: "",
    oldInput: "",
    validationErrors: [],
  });
};

exports.postSignIn = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login-register", {
      pageTitle: "Error in SignIn",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        email,
        password,
      },
    });
  }
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("auth/login-register", {
        pageTitle: "SignIn Error",
        path: "/login",
        errorMessage: "Check Your email,Enter the correct Email and password..",
        oldInput: "",
        validationErrors: [],
      });
    }
    const verifiedPassword = await bcrypt.compare(password, user.password);
    if (verifiedPassword) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save();
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Singup",
    path: "/signup",
    errorMessage: "",
    oldInput: "",
    validationErrors: [],
  });
};

exports.postSignUp = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Error Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        username,
        email,
        password,
        confirmPassword,
      },
    });
  }
  try {
    const userDoc = await User.findOne({ email: email });
    if (userDoc) {
      return res.redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      post: { posts: [] },
    });
    const result = await user.save();
    res.redirect("/login");
    await transporter.sendMail({
      to: req.body.email,
      from: "iam@rahulshah.com.np",
      subject: "Signup Successful...",
      html: `
            <p>Hello${result.username}, You have successfully SignUp..Thanks for connecting with us.. </p>
            <p>Hope,You Enjoy the service..</p>
          `,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getResetpassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset-password",
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        req.flash("error", "No account with that email found.");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();

      res.redirect("/");
      await transporter.sendMail({
        to: req.body.email,
        from: "iam@rahulshah.com.np",
        subject: "Password reset",
        html: `
              <p>You requested a password reset</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
            `,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    res.render("auth/new-password", {
      pageTitle: "New Password",
      path: "/getNewPassword",
      errorMessage: "",
      userId: user._id.toString(),
      passwordToken: token,
      validationErrors: [],
      oldInput: {
        password: "",
        confirmPassword: "",
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const passwordToken = req.body.passwordToken;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.body.userId;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.render("auth/new-password", {
      pageTitle: "Error In New Password",
      path: "/getNewPassword",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: {
        password,
        confirmPassword,
      },
      userId,
      passwordToken,
    });
  }
  try {
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.redirect("/");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
