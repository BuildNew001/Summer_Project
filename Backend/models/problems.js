const mongoose = require("mongoose");
const ProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'], 
    },
    inputFormat: { 
      type: String,
      required: true,
    },
    outputFormat: { 
      type: String,
      required: true,
    },
    constraints: {
      type: String,
      required: true,
    },
    sampleTestCases: {
      type: [
        {
          input: { type: String, required: true },
          output: { type: String, required: true },
        },
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFeatured: {
    type: Boolean,
    default: false,
    index: true, 
  },
  },
  { timestamps: true } 
);

const Problem = mongoose.model("Problem", ProblemSchema);
module.exports = Problem;
