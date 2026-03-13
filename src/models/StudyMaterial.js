const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
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
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    type: {
      type: String,
      enum: ["video", "pdf", "article", "link", "code", "image", "other"],
      required: [true, "Material type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    url: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      maxlength: [5000, "Notes must be at most 5000 characters"],
      default: "",
    },
    codeSnippet: {
      type: String,
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

// ─── Text index for search ───────────────────────────────
studyMaterialSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
