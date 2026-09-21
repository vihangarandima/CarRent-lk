const mongoose = require("mongoose");

const SiteSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Auto Snapshot" },
    description: { type: String, default: "" },
    config: { type: Object, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSnapshot", SiteSnapshotSchema);
