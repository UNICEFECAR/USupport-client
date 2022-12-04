import { getAllConsultationsQuery } from "#queries/consultation";

import { getProviderByIdQuery } from "#queries/providers";

import { providerNotFound } from "#utils/errors";

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

  let response = [];

  for (let i = 0; i < consultations.length; i++) {
    const consultation = consultations[i];
    const providerName = providersDetails[consultation.provider_detail_id].name;
    const providerPatronym =
      providersDetails[consultation.provider_detail_id].patronym;
    const providerSurname =
      providersDetails[consultation.provider_detail_id].surname;

    response.push({
      consultation_id: consultation.consultation_id,
      provider_detail_id: consultation.provider_detail_id,
      provider_name: `${providerName} ${
        providerPatronym ? providerPatronym + " " : ""
      }${providerSurname}`,
      provider_image: providersDetails[consultation.provider_detail_id].image,
      time: consultation.time,
      status: consultation.status,
    });
  }

  return response;
};
