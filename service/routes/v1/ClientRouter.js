import express from "express";

import { populateClient, populateUser } from "#middlewares/populateMiddleware";

import {
  getClientByIdSchema,
  updateClientDataSchema,
  deleteClientDataSchema,
  updateClientImageSchema,
  updateClientDataProcessingSchema,
  deleteClientImageSchema,
  addInformationPortalSuggestionSchema,
  addClientRatingSchema,
  addClientPushNotificationTokenSchema,
  checkIsCouponAvailableSchema,
  deleteChatHistorySchema,
  addClientCategoryInteractionSchema,
  getCategoryInteractionsSchema,
  addPlatformSuggestionSchema,
  addScreeningAnswerSchema,
  getAllScreeningQuestionsSchema,
  getClientScreeningSessionsSchema,
  getClientAnswersForSessionByIdSchema,
  createScreeningSessionSchema,
  updateClientHasCheckedBaselineAssessmentSchema,
} from "#schemas/clientSchemas";

import {
  getClientById,
  updateClientData,
  deleteClientData,
  updateClientImage,
  updateClientDataProcessing,
  deleteClientImage,
  addInformationPortalSuggestion,
  addClientRating,
  addClientPushNotificationToken,
  checkIsCouponAvailable,
  deleteChatHistory,
  addClientCategoryInteraction,
  getCategoryInteractions,
  addPlatformSuggestion,
  addScreeningAnswer,
  getAllScreeningQuestions,
  getClientScreeningSessions,
  getClientAnswersForSessionById,
  createScreeningSession,
  updateClientHasCheckedBaselineAssessment,
} from "#controllers/clients";

const router = express.Router();

router.post(
  "/add-platform-suggestion",
  populateUser,
  async (req, res, next) => {
    /**
     * #route   POST /client/v1/client/add-platform-suggestion
     * #desc    Add platform suggestion
     */
    const country = req.header("x-country-alpha-2");
    const client_id = req.user.client_detail_id;
    const payload = req.body;

    return await addPlatformSuggestionSchema
      .noUnknown(true)
      .strict()
      .validate({ country, client_id, ...payload })
      .then(addPlatformSuggestion)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
);

router.post("/screening/add-answer", populateUser, async (req, res, next) => {
  /**
   * #route   POST /client/v1/client/screening/add-answer
   * #desc    Add screening answer
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const clientDetailId = req.user.client_detail_id;
  const payload = req.body;

  return await addScreeningAnswerSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, clientDetailId, ...payload })
    .then(addScreeningAnswer)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/screening/questions", async (req, res, next) => {
  /**
   * #route   GET /client/v1/client/screening/questions
   * #desc    Get all screening questions sorted by position
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  return await getAllScreeningQuestionsSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language })
    .then(getAllScreeningQuestions)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/screening/sessions", populateUser, async (req, res, next) => {
  /**
   * #route   GET /client/v1/client/screening/sessions
   * #desc    Get all screening sessions overview for the current client (without detailed answers)
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const clientDetailId = req.user.client_detail_id;

  return await getClientScreeningSessionsSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, clientDetailId })
    .then(getClientScreeningSessions)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/screening/answers", populateUser, async (req, res, next) => {
  /**
   * #route   GET /client/v1/client/screening/answers
   * #desc    Get screening answers for a session
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const clientDetailId = req.user.client_detail_id;
  const { sessionId } = req.query;

  return await getClientAnswersForSessionByIdSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      clientDetailId,
      screeningSessionId: sessionId,
    })
    .then(getClientAnswersForSessionById)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post(
  "/screening/create-session",
  populateUser,
  async (req, res, next) => {
    /**
     * #route   POST /client/v1/client/screening/create-session
     * #desc    Create a new screening session
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");
    const clientDetailId = req.user.client_detail_id;

    return await createScreeningSessionSchema
      .noUnknown(true)
      .strict()
      .validate({ country, language, clientDetailId })
      .then(createScreeningSession)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
);

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
      ...payload,
      country,
      language,
      user_id,
      client_id,
      currentEmail,
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

router
  .route("/information-portal-suggestion")
  .post(populateUser, async (req, res, next) => {
    /**
     * #route   POST /client/v1/client/information-portal-suggestion
     * #desc    Send a suggestion to the information portal
     */
    const country = req.header("x-country-alpha-2");
    const client_id = req.user.client_detail_id;

    const payload = req.body;

    return await addInformationPortalSuggestionSchema
      .noUnknown(true)
      .strict()
      .validate({ country, client_id, ...payload })
      .then(addInformationPortalSuggestion)
      .then((result) => res.status(200).send(result))
      .catch(next);
  });

router.post("/add-rating", populateUser, async (req, res, next) => {
  /**
   * #route   POST /client/v1/client/add-rating
   * #desc    Add rating for client
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const client_id = req.user.client_detail_id;
  const payload = req.body;

  return await addClientRatingSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, client_id, ...payload })
    .then(addClientRating)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.put(
  "/add-push-notification-token",
  populateUser,
  async (req, res, next) => {
    /**
     * #route   PUT /client/v1/client/add-push-notification-token
     * #desc    Add push notification token for client
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");

    const client_id = req.user.client_detail_id;
    const payload = req.body;

    return await addClientPushNotificationTokenSchema
      .noUnknown(true)
      .strict()
      .validate({ country, language, client_id, ...payload })
      .then(addClientPushNotificationToken)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
);

router.get("/check-coupon", populateUser, async (req, res, next) => {
  /**
   * #route   GET /client/v1/client/check-coupon
   * #desc    Check coupon
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const client_detail_id = req.user.client_detail_id;

  const { couponCode } = req.query;

  return await checkIsCouponAvailableSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, client_detail_id, couponCode })
    .then(checkIsCouponAvailable)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.put("/chat-history", populateUser, async (req, res, next) => {
  /**
   * #route   DELETE /client/v1/client/chat-history
   * #desc    Delete chat history
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const { time } = req.body;

  const client_detail_id = req.user.client_detail_id;

  return await deleteChatHistorySchema
    .noUnknown(true)
    .strict()
    .validate({ client_detail_id, language, country, time })
    .then(deleteChatHistory)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post(
  "/add-category-interaction",
  populateUser,
  async (req, res, next) => {
    /**
     * #route   POST /client/v1/client/add-category-interaction
     * #desc    Add category interaction
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");

    const clientDetailId = req.user.client_detail_id;
    const payload = req.body;

    return await addClientCategoryInteractionSchema
      .noUnknown(true)
      .strict()
      .validate({ country, language, clientDetailId, ...payload })
      .then(addClientCategoryInteraction)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
);

router.get("/category-interactions", populateUser, async (req, res, next) => {
  /**
   * #route   GET /client/v1/client/category-interactions
   * #desc    Get category interactions
   */
  const country = req.header("x-country-alpha-2");
  const clientDetailId = req.user.client_detail_id;

  return await getCategoryInteractionsSchema
    .noUnknown(true)
    .strict()
    .validate({ country, clientDetailId })
    .then(getCategoryInteractions)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.patch(
  "/has-checked-baseline-assesment",
  populateUser,
  async (req, res, next) => {
    /**
     * #route   PATCH /client/v1/client/has-checked-baseline-assesment
     * #desc    Update the client has checked baseline assessment
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");
    const clientDetailId = req.user.client_detail_id;
    const payload = req.body;

    return await updateClientHasCheckedBaselineAssessmentSchema
      .noUnknown(true)
      .strict()
      .validate({ country, language, clientDetailId, ...payload })
      .then(updateClientHasCheckedBaselineAssessment)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
);

export { router };
