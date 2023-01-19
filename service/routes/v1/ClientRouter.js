import express from "express";

import { populateClient, populateUser } from "#middlewares/populateMiddleware";

import {
  getClientByIdSchema,
  updateClientDataSchema,
  deleteClientDataSchema,
  updateClientImageSchema,
  updateClientDataProcessingSchema,
  deleteClientImageSchema,
} from "#schemas/clientSchemas";

import {
  getClientById,
  updateClientData,
  deleteClientData,
  updateClientImage,
  updateClientDataProcessing,
  deleteClientImage,
} from "#controllers/clients";

const router = express.Router();

router.get("/", populateClient, async (req, res) => {
  /**
   * #route   GET /client/v1/client
   * #desc    Get current client data
   */
  const clientData = req.client;

  res.status(200).send(clientData);
});

router.get("/by-id", async (req, res, next) => {
  /**
   * #route   GET /client/v1/client/by-id
   * #desc    Get client data by id
   */

  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const clientId = req.query.clientId;

  return await getClientByIdSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      clientId,
    })
    .then(getClientById)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.put("/", populateClient, async (req, res, next) => {
  /**
   * #route   PUT /client/v1/client
   * #desc    Update current client data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const user_id = req.header("x-user-id");

  const client_id = req.client.client_detail_id;
  const currentEmail = req.client.email;

  const payload = req.body;

  return await updateClientDataSchema(language)
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      user_id,
      client_id,
      currentEmail,
      ...payload,
    })
    .then(updateClientData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.delete("/", populateClient, populateUser, async (req, res, next) => {
  /**
   * #route   DELETE /client/v1/client
   * #desc    Delete current client data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const client_id = req.client.client_detail_id;
  const image = req.client.image;

  const user_id = req.user.user_id;
  const userPassword = req.user.password;

  const payload = req.body;

  return await deleteClientDataSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      client_id,
      user_id,
      image,
      userPassword,
      ...payload,
    })
    .then(deleteClientData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.put("/image", populateClient, populateUser, async (req, res, next) => {
  /**
   * #route   PUT /client/v1/client/image
   * #desc    Update the client image
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const user_id = req.header("x-user-id");

  const client_id = req.client.client_detail_id;

  const image = req.body.image;

  return await updateClientImageSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, client_id, user_id, image })
    .then(updateClientImage)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.delete("/image", populateClient, async (req, res, next) => {
  /**
   * #route   DELETE /client/v1/client/image
   * #desc    Delete the client image
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const user_id = req.header("x-user-id");

  const client_id = req.client.client_detail_id;

  return await deleteClientImageSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, client_id, user_id })
    .then(deleteClientImage)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.put(
  "/data-processing-agreement",
  populateClient,
  async (req, res, next) => {
    /**
     * #route   PUT /client/v1/client/data-processing-agreement
     * #desc    Update the client data-processing-agreement
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");
    const user_id = req.header("x-user-id");

    const client_id = req.client.client_detail_id;
    const payload = req.body;

    return await updateClientDataProcessingSchema
      .noUnknown(true)
      .strict()
      .validate({ country, language, user_id, client_id, ...payload })
      .then(updateClientDataProcessing)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
);

export { router };
