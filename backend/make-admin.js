const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

const email = process.argv[2];

if (!email) {
  console.log("Usage: node make-admin.js <email>");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB Connected");
    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      process.exit(1);
    }
    user.role = "admin";
    await user.save();
    console.log(`SUCCESS: User "${user.name}" (${user.email}) is now an ADMIN!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
