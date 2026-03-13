const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Milestone", "Learning", "Achievement", "Consistency", "Community", "Career", "Other"],
    },
    icon: {
      type: String,
      default: "trophy",
    },
    relatedProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Achievement", achievementSchema);
