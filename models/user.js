const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    default: null,
    validate:{
        validator:function(value){
            return validator.isEmail(value);
        },
        message:"{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    required: true,
  },
  UserName: {
    type: String,
    required: true,
    unique: true,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin", "setter"],
    default: "user",
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  dob:{
    type:Date,
    default:null,
  }
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
     return next();
  }
  this.password = await bcrypt.hash(this.password,10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;

