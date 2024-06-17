const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const Schema = mongoose.Schema;

const brandSchema = new Schema(
  {
    brandName: { type: String },
    deleteAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Add plugin to schema
brandSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Brand", brandSchema);
