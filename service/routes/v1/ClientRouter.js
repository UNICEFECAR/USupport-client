import express from "express";

import { securedRoute } from "#middlewares/auth";

import {
  updateClientDataSchema,
  deleteClientDataSchema,
} from "#schemas/clientSchemas";

import { updateClientData, deleteClientData } from "#controllers/clients";

const router = express.Router();

router.get("/", securedRoute, async (req, res) => {
  /**
   * #route   GET /client/v1/client
   * #desc    Get current client data
   */
  const clientData = req.client;

  res.status(200).send(clientData);
});

router.put("/", securedRoute, async (req, res, next) => {
  /**
   * #route   PUT /client/v1/client
   * #desc    Update current client data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const client_id = req.client.client_detail_id;
  const payload = req.body;

  return await updateClientDataSchema(language)
    .noUnknown(true)
    .strict()
    .validate({ country, language, client_id, ...payload })
    .then(updateClientData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.delete("/", securedRoute, async (req, res, next) => {
  /**
   * #route   DELETE /client/v1/client
   * #desc    Delete current client data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const client_id = req.client.client_detail_id;
  const user_id = req.user.user_id;

  return await deleteClientDataSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, client_id, user_id })
    .then(deleteClientData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
