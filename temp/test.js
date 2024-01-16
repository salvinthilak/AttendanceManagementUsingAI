const mongoose = require("mongoose");
mongoose
  .connect("mongodb:localhost:27017/school")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("error");
  });

const studentsName = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const collection = new mongoose.model("students", studentsName);
