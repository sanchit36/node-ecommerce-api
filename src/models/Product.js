const mongoose = require("mongoose");
const slugify = require("slugify");

const ProductSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
      },
    ],
    colors: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
      },
    ],
    sizes: [
      {
        name: {
          type: String,
          required: true,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre("save", function (next) {
  this.slug = slugify(this.title.toLowerCase());
  next();
});

ProductSchema.methods.toJSON = function () {
  const product = this;
  const productObject = product.toObject();

  productObject.id = product._id;
  delete productObject._id;
  delete productObject.__v;

  return productObject;
};

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
