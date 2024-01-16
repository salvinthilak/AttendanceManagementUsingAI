const express = require("express");
const path = require("path");
const { ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { connectToDb, getDb } = require("./server");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public/face-api"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/profilePic");
  },
  filename: (req, file, cb) => {
    const filename = file.originalname;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });
// #####################################################################################
//db connection
// #####################################################################################

let db;
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("Server Running on Port : http://127.0.0.1:3000/");
    });
    db = getDb();
  }
});

// app.get("/user", (req, res) => {
//   let label = [];
//   db.collection("userCredentials")
//     .find()
//     .sort({ regNo: 1 })
//     .forEach((user) => label.push(user.FullName))
//     .then(() => {
//       res.status(200).json(label);
//     })
//     .catch(() => {
//       res.status(500).json({ error: "Couldn't fetch the documents" });
//     });
// });

app.get("/home1", (req, res) => {
  res.render("dummy_user_dashboard");
});

app.get("/signUp", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/user_signup.html"));
});
app.post("/signUp", async (req, res) => {
  let regNo = req.body.regNo;
  let username = req.body.userName;
  let email = req.body.email;
  let pswd = req.body.pswd;

  const registration = {
    regNo: regNo,
    userName: username,
    email: email,
    pswd: pswd,
  };

  db.collection("userCredentials")
    .insertOne(registration)
    .then(() => {
      return res.redirect("/home1");
    });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/user_login.html"));
});
app.post("/", async (req, res) => {
  const user = req.query.u || 0;

  try {
    const check = await db
      .collection("userCredentials")
      .findOne({ email: req.body.emailId });
    if (check.pswd === req.body.psswd) {
      res.redirect("/home?u=" + user);
    } else {
      res.redirect("/signUp");
    }
  } catch {
    res.status(500).json(" User doesn't Exist");
  }
});
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/user_dashboard.html"));
});
app.get("/userStats", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/user_stats.html"));
});
app.get("/PasswordReset", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/forgot_pswd.html"));
});
app.post("/PasswordReset", async (req, res) => {
  let regNo = req.body.regNo;
  let email = req.body.emailId;
  let pswd = req.body.newPass;

  const pswdReset = {
    pswd: pswd,
  };

  try {
    const check = await db
      .collection("userCredentials")
      .findOne({ regNo: req.body.regNo });
    if (check.email === req.body.emailId) {
      db.collection("userCredentials")
        .updateOne({ regNo: regNo }, { $set: pswdReset }, false, true)
        .then(() => {
          return res.redirect("/");
        });
    } else {
      res.status(500).json("Cannot perform action");
    }
  } catch {
    res.status(500).json(" User doesn't Exist");
  }
});

app.get("/registration1", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/registration_Page1.html"));
});
app.post("/registration1", async (req, res) => {
  let fullName = req.body.fullName;
  let Course = req.body.selectCourse;
  let regNo = req.body.regNo;
  let email = req.body.emailId;
  let dob = req.body.DOB;
  let Section = req.body.section;
  let Year = req.body.year;
  let Gender = req.body.Gender;

  const registration1 = {
    FullName: fullName,
    Course: Course,
    DOB: dob,
    Section: Section,
    Year: Year,
    Gender: Gender,
  };
  try {
    const check = await db
      .collection("userCredentials")
      .findOne({ regNo: req.body.regNo });
    if (check.email === req.body.emailId) {
      db.collection("userCredentials")
        .updateOne({ regNo: regNo }, { $set: registration1 }, false, true)
        .then(() => {
          return res.redirect("/registration2");
        });
    } else {
      res.status(500).json("Cannot perform action");
    }
  } catch {
    res.status(500).json(" User doesn't Exist");
  }
});

// app.get("/registration2", (req, res) => {
//   res.sendFile(path.join(__dirname + "/public/registration_Page2.html"));
// });

app.get("/registration2", (req, res) => {
  res.render("registration_Page2");
});

app.post("/registration2", upload.single("myProfilePic"), (req, res) => {
  // res.sendFile(path.join(__dirname + "/public/registration_Page2.html"));
  res.redirect("/registration3");
});

const faceStorage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/face-api/labels");
  },
  filename: (req, file, cb) => {
    const filename = file.originalname;
    cb(null, filename);
  },
});
const faceUpload = multer({ storage: faceStorage1 });

app.get("/registration3", (req, res) => {
  res.render("registration_Page3");
});

app.post("/registration3", faceUpload.single("faceTrain"), (req, res) => {
  res.redirect("/regSuccessful");
});

app.get("/regSuccessful", (req, res) => {
  res.render("registration_Success");
});

app.get("/attendance", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/face-api/face-recognition.html"));
});

app.get("/markAttendance", (req, res) => {
  res.render("my_Class");
});

app.post("/markAttendance", (req, res) => {});

// #####################################################################################
// ADMIN MODULE
// #####################################################################################

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/admin/admin.html"));
});
app.post("/admin", async (req, res) => {
  try {
    const check = await db
      .collection("adminCredentials")
      .findOne({ email: req.body.emailId });
    if (check.pswd === req.body.psswd) {
      res.redirect("/adminDash");
    } else {
      res.redirect("/admin");
    }
  } catch {
    res.status(500).json(" User doesn't Exist");
  }
});

app.get("/adminDash", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/admin/admin_dashboard.html"));
});
app.get("/facultyReg", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/admin/facultyRegistration.html"));
});
app.post("/facultyReg", async (req, res) => {
  let fullName = req.body.fullName;
  let email = req.body.emailId;
  let password = req.body.password;
  let course = req.body.selectCourse;
  let subject = req.body.subject;
  let year = req.body.year;

  await db
    .collection("facultyCredentials")
    .insertOne({
      FullName: fullName,
      email: email,
      pass: password,
      Course: course,
      Subject: subject,
      Year: year,
    })
    .then(() => {
      return res.redirect("/facultyDash");
    });
});

// #####################################################################################
// FACULTY MODULE
// #####################################################################################

app.get("/faculty", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/faculty_login.html"));
});
app.post("/faculty", async (req, res) => {
  try {
    const check = await db
      .collection("facultyCredentials")
      .findOne({ email: req.body.emailId });
    if (check.pass === req.body.psswd) {
      res.redirect("/facultyDash");
    } else {
      res.redirect("/faculty");
    }
  } catch {
    res.status(500).json(" User doesn't Exist");
  }
});
app.get("/facultyDash", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/faculty_dashboard.html"));
});

app.get("/userApprove", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/admin/user_approval.html"));
});
