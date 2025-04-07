import {
  getAllConsultationsQuery,
  getSecurityCheckAnswersByConsultationIdQuery,
  addSecurityCheckAnswersQuery,
  updateSecurityCheckAnswersQuery,
  unblockSlotQuery,
} from "#queries/consultation";

import { getProviderByIdQuery } from "#queries/providers";
import { getSponsorNameAndImageByCampaignIdQuery } from "#queries/sponsors";

import { providerNotFound, consultationNotFound } from "#utils/errors";

export const getAllConsultations = async ({ country, language, client_id }) => {
  const consultations = await getAllConsultationsQuery({
    poolCountry: country,
    client_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return [];
      } else {
        return res.rows;
      }
    })
    .catch((err) => {
      throw err;
    });

  const providersToFetch = Array.from(
    new Set(
      consultations.map((consultation) => consultation.provider_detail_id)
    )
  );

  let providersDetails = {};

  for (let i = 0; i < providersToFetch.length; i++) {
    const providerId = providersToFetch[i];

    providersDetails[providerId] = await getProviderByIdQuery({
      poolCountry: country,
      providerId,
    })
      .then((res) => {
        if (res.rowCount === 0) {
          throw providerNotFound(language);
        } else {
          return res.rows[0];
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  const campaignIds = Array.from(
    new Set(consultations.map((consultation) => consultation.campaign_id))
  );

  let sponsorsData;
  if (campaignIds.length > 0) {
    sponsorsData = await getSponsorNameAndImageByCampaignIdQuery({
      poolCountry: country,
      campaignIds,
    })
      .then((res) => {
        if (res.rowCount === 0) {
          return [];
        } else {
          return res.rows;
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  let response = [];

  for (let i = 0; i < consultations.length; i++) {
    const consultation = consultations[i];
    const providerName = providersDetails[consultation.provider_detail_id].name;
    const providerPatronym =
      providersDetails[consultation.provider_detail_id].patronym;
    const providerSurname =
      providersDetails[consultation.provider_detail_id].surname;

    const res = {
      consultation_id: consultation.consultation_id,
      chat_id: consultation.chat_id,
      provider_detail_id: consultation.provider_detail_id,
      provider_name: `${providerName} ${
        providerPatronym ? providerPatronym + " " : ""
      }${providerSurname}`,
      client_detail_id: consultation.client_detail_id,
      provider_image: providersDetails[consultation.provider_detail_id].image,
      time: consultation.time,
      status: consultation.status,
      price: consultation.price,
      campaign_id: consultation.campaign_id,
      organization_id: consultation.organization_id,
    };

    if (consultation.campaign_id) {
      const sponsorData = sponsorsData.find(
        (sponsor) => sponsor.campaign_id === consultation.campaign_id
      );
      if (sponsorData) {
        res.sponsor_name = sponsorData.sponsor_name;
        res.sponsor_image = sponsorData.sponsor_image;
        res.coupon_code = sponsorData.coupon_code;
      }
    }

    response.push(res);
  }

  return response;
};

export const getSecurityCheckAnswersByConsultationId = async ({
  country,
  consultation_id,
}) => {
  const answers = await getSecurityCheckAnswersByConsultationIdQuery({
    poolCountry: country,
    consultation_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return {};
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  return answers;
};

export const addSecurityCheckAnswers = async ({
  country,
  consultationId,
  providerAttend,
  contactsDisclosure,
  suggestOutsideMeeting,
  identityCoercion,
  unsafeFeeling,
  moreDetails,
  feeling,
  addressedNeeds,
  improveWellbeing,
  feelingsNow,
  additionalComment,
}) => {
  return await addSecurityCheckAnswersQuery({
    poolCountry: country,
    consultationId,
    providerAttend,
    contactsDisclosure,
    suggestOutsideMeeting,
    identityCoercion,
    unsafeFeeling,
    moreDetails,
    feeling,
    addressedNeeds,
    improveWellbeing,
    feelingsNow,
    additionalComment,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return {};
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateSecurityCheckAnswers = async ({
  country,
  consultationId,
  providerAttend,
  contactsDisclosure,
  suggestOutsideMeeting,
  identityCoercion,
  unsafeFeeling,
  moreDetails,
  feeling,
  addressedNeeds,
  improveWellbeing,
  feelingsNow,
  additionalComment,
}) => {
  return await updateSecurityCheckAnswersQuery({
    poolCountry: country,
    consultationId,
    providerAttend,
    contactsDisclosure,
    suggestOutsideMeeting,
    identityCoercion,
    unsafeFeeling,
    moreDetails,
    feeling,
    addressedNeeds,
    improveWellbeing,
    feelingsNow,
    additionalComment,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return {};
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const unblockSlot = async ({
  country,
  consultationId,
  client_id: clientDetailId,
}) => {
  return await unblockSlotQuery({
    poolCountry: country,
    consultationId,
    clientDetailId,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw consultationNotFound(language);
      } else {
        return { success: true };
      }
    })
    .catch((err) => {
      throw err;
    });
};
