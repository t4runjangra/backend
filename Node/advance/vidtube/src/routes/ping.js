import express from "express";
const router = express.Router();

// Simple ping route
router.get("/ping", (req, res) => {
  res.status(200).json({ success: true, message: "pong" });
});

export default router;
