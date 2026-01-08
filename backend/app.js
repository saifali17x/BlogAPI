import express from "express";
import cors from "cors";
import passport from "passport";
import "dotenv/config";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({ message: "API is working properly!" });
});

// Routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
