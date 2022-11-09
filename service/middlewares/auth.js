import passport from "passport";
import passportJWT from "passport-jwt";

import { getUserByID } from "#queries/users";
import { getClientByUserID } from "#queries/clients";

import { notAuthenticated } from "#utils/errors";

const jwtStrategy = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;

const JWT_KEY = process.env.JWT_KEY;

passport.use(
  "jwt",
  new jwtStrategy(
    {
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_KEY,
      issuer: "online.usupport.userApi",
      audience: "online.usupport.app",
      algorithms: ["HS256"],
      passReqToCallback: true,
    },
    async (req, jwt_payload, done) => {
      try {
        const country = req.header("x-country-alpha-2");
        const user_id = jwt_payload.sub;
        const user = await getUserByID(country, user_id)
          .then((res) => res.rows[0])
          .catch((err) => {
            throw err;
          });
        const client = await getClientByUserID(country, user_id)
          .then((res) => res.rows[0])
          .catch((err) => {
            throw err;
          });

        if (!user && !client) {
          done(null, false);
        }
        done(null, user, client);
      } catch (error) {
        done(error);
      }
    }
  )
);

export const authenticateJWT = (isMiddleWare, req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    async (err, user, client) => {
      const language = req.header("x-language-alpha-2");

      if (err || !user || !client) {
        return next(notAuthenticated(language));
      }
      req.user = user;
      req.client = client;

      if (isMiddleWare) return next();
      else {
        return res.status(200).send({ user: req.user, client: req.client });
      }
    }
  )(req, res, next);
};

export const securedRoute = (req, res, next) => {
  return authenticateJWT(true, req, res, next);
};
