const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default:
        "https://crowd-literature.eu/wp-content/uploads/2015/01/no-avatar.gif",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password must not contain password");
        }
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// virtual functions
UserSchema.virtual("fullname").get(function () {
  return this.firstName + " " + this.lastName;
});

UserSchema.virtual("cart", {
  ref: "Cart",
  localField: "_id",
  foreignField: "user",
});

// TO JSON method will send the userObject to frontend
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject({ virtuals: true });

  delete userObject.password;
  delete userObject.__v;
  delete userObject._id;

  return userObject;
};

// revoking the refresh token for a user
UserSchema.methods.revokeRefreshToken = async function () {
  const user = this;
  user.tokenVersion += 1;
  await user.save();
};

// find a user with the email and password
UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email }).populate("cart");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};

// Hash password before saving it
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// give custom error on unique parameters
UserSchema.post("save", (error, doc, next) => {
  if (error?.keyPattern?.username && error.code === 11000) {
    next(new Error("Username already in use"));
  } else if (error?.keyPattern?.email && error.code === 11000) {
    next(new Error("Email already in use"));
  } else {
    next(error);
  }
});

// Delete user cart when user is removed
UserSchema.pre("remove", async function (next) {
  const user = this;
  await Cart.deleteOne({ user: user._id });
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
