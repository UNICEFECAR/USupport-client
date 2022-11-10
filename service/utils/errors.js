import { t } from "#translations/index";

export const userNotFound = (language) => {
  const error = new Error();
  error.message = t("user_not_found_error", language);
  error.name = "USER NOT FOUND";
  error.status = 404;
  return error;
};

export const notAuthenticated = (language) => {
  const error = new Error();
  error.message = t("not_authenticated_error", language);
  error.name = "NOT AUTHENTICATED";
  error.status = 401;
  return error;
};
