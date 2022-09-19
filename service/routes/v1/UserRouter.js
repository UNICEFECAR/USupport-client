import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  /**
   * #route   GET /user/v1/
   * #desc    Get current user
   */

  res.json({}).status(200);
});

export { router };
