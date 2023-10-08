import express, { Express, NextFunction, Request, Response } from 'express';
import router from './router';
import { ApiError } from './utils/error.handler';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import createLoggerInstance from './config/logger';
import env from './config/env';
import httpLogger from './middleware/http.logger';
import notfoundHandler from './utils/notfound.handler';
import httpErrorHandler from './utils/http.error.handler'

import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';

const log = createLoggerInstance(__filename);

const app: Express = express();
const PORT = env.PORT || 3000;

const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } = env;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(httpLogger);

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID as string,
    clientSecret: LINKEDIN_CLIENT_SECRET as string,
    callbackURL: "http://localhost:5000/auth/linkedin/callback",
    scope: ['email', 'profile','openid'],
}, function (accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    log.info(accessToken)
    process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        
        return done(null, profile);
    });
}))

app.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });

app.get('/auth/linkedin/callback',passport.authenticate('linkedin', {
    successRedirect: '/',
    failureRedirect: '/login'
}))

app.use('/api/v1', router.v1)

app.use(notfoundHandler);

app.use(httpErrorHandler);


app.listen(PORT, () => {
	log.info(`[server]-[✅]: Server is running on http://localhost:${PORT}/`);
})
