import { t } from "#translations/index";

export const notAuthenticated = (language) => {
  const error = new Error();
  error.message = t("not_authenticated_error", language);
  error.name = "NOT AUTHENTICATED";
  error.status = 401;
  return error;
};
