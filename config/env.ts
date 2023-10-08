import joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envVarsSchema = joi.object().keys({
    NODE_ENV: joi.string().valid('development', 'production', 'test').required(),
    APP_NAME: joi.string().required(),
    PORT: joi.number().default(3000),
    DATABASE_URL: joi.string().uri().required(),
    LINKEDIN_CLIENT_ID: joi.string().required(),
    LINKEDIN_CLIENT_SECRET: joi.string().required(),
}).unknown().required();

// init

if(envVarsSchema.validate(process.env).error) throw new Error(`❌[config]-[env]: ${envVarsSchema.validate(process.env).error}`)

console.log(`✅[config]-[env]: profile [${envVarsSchema.validate(process.env).value.NODE_ENV}]`)
console.log(`✅[config]-[env]: app-name [${envVarsSchema.validate(process.env).value.APP_NAME}]`)

const  env = {
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.APP_NAME,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
}

export default env;