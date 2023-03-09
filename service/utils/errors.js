import { t } from "#translations/index";

export const incorrectPassword = (language) => {
  const error = new Error();
  error.message = t("incorrect_password_error", language);
  error.name = "INCORRECT PASSWORD";
  error.status = 404;
  return error;
};

export const emailUsed = (language) => {
  const error = new Error();
  error.message = t("email_already_used_error", language);
  error.name = "EMAIL ALREADY USED";
  error.status = 409;
  return error;
};

export const clientNotFound = (language) => {
  const error = new Error();
  error.message = t("client_not_found_error", language);
  error.name = "CLIENT NOT FOUND";
  error.status = 404;
  return error;
};

export const providerNotFound = (language) => {
  const error = new Error();
  error.message = t("provider_not_found_error", language);
  error.name = "PROVIDER NOT FOUND";
  error.status = 404;
  return error;
};

export const couponNotFound = (language) => {
  const error = new Error();
  error.message = t("coupon_not_found_error", language);
  error.name = "COUPON NOT FOUND";
  error.status = 404;
  return error;
};

export const clientLimitReached = (language) => {
  const error = new Error();
  error.message = t("client_limit_reached_error", language);
  error.name = "CLIENT LIMIT REACHED";
  error.status = 403;
  return error;
};

export const couponsLimitReached = (language) => {
  const error = new Error();
  error.message = t("coupons_limit_reached_error", language);
  error.name = "COUPONS LIMIT REACHED";
  error.status = 403;
  return error;
};
