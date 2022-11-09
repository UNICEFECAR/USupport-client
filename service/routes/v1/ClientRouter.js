import express from "express";

import { securedRoute } from "#middlewares/auth";

const router = express.Router();

router.get("/", securedRoute, async (req, res) => {
  /**
   * #route   GET /client/v1/client
   * #desc    Get current client data
   */
  const clientData = req.client;

  res.status(200).send(clientData);
});

export { router };
