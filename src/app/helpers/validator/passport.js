const UserSchema = require("../../models/user");
class PassportAuthenticator {
  #packages;
  #models;
  #start;
  constructor({ packages, models }) {
    this.#packages = packages;
    this.#models = models;
    this.jwtOptions = {};
    this.#start = this.init();
  }

  init = () => {
    this.jwtOptions = {
      jwtFromRequest:
        this.#packages["passport-jwt"].ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
    };
    const jwtStrategy = new this.#packages["passport-jwt"].Strategy(
      this.jwtOptions,
      async (payload, done) => {
        try {
          const user = await this.#models.User.findOne({
            _id: payload.userId,
          }).populate("account");

          if (user && user.sessions.includes(payload.sessionId)) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (err) {
          return done(err, false);
        }
      }
    );
    this.#packages.passport.use(jwtStrategy);
  };
  authenticateUser = () => {
    return this.#packages.passport.authenticate("jwt", {
      session: false,
    });
  };
}

module.exports = {
  class: PassportAuthenticator,
  injectableClass: [],
  injectableModel: [UserSchema],
};
