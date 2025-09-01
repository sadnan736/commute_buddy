


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();




const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const map_routes = require("./routes/map_routes");
const report_routes = require("./routes/report_routes")

const app = express();
const PORT = process.env.PORT || 4321;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/map", map_routes);
app.use("/api/reports",report_routes)


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });