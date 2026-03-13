const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Step title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [150, "Title must be at most 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed", "on-hold"],
      default: "planned",
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
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    steps: {
      type: [stepSchema],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: null,
    },
    liveUrl: {
      type: String,
      default: null,
    },
    thumbnail: {
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
        // Transform step _id → id
        if (ret.steps) {
          ret.steps = ret.steps.map((s) => ({
            ...s,
            id: s._id,
            _id: undefined,
          }));
        }
        return ret;
      },
    },
  }
);

// ─── Text index for search ───────────────────────────────
projectSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Project", projectSchema);
