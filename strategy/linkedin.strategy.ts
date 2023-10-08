import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import env from '../config/env';

const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } = env;

const linkedInStrategy = new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID as string,
    clientSecret: LINKEDIN_CLIENT_SECRET as string,
    callbackURL: "http://localhost:5000/api/v1/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
}, function (accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
});

export default linkedInStrategy;