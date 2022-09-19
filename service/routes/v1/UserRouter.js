import express from "express";

import { getUserSchema } from "../../schemas/UserControllerSchemas.js";

const router = express.Router();

router.get("/", async (req, res) => {
  /**
   * #route   GET /user/v1/user
   * #desc    Get current user
   */
  const user_id = "123"; // Add Auth logic to get User ID

  return await getUserSchema
    .noUnknown(true)
    .strict(true)
    .validate({ user_id })
    .then() // Add controller here
    .then((result) => res.json(result).status(200));
});

export { router };
