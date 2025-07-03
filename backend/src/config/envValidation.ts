import Joi from 'joi';

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  POSTGRES_URL: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  SUPABASE_JWT_SECRET: Joi.string().required(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Joi.string().required(),
  POSTGRES_PRISMA_URL: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  POSTGRES_URL_NON_POOLING: Joi.string().required(),
  NEXT_PUBLIC_FACEBOOK_APP_ID: Joi.string().required(),
  FACEBOOK_APP_SECRET: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  KV_URL: Joi.string().uri().required(),
  KV_REST_API_URL: Joi.string().uri().required(),
  KV_REST_API_TOKEN: Joi.string().required(),
  KV_REST_API_READ_ONLY_TOKEN: Joi.string().required(),
  REDIS_URL: Joi.string().uri().required(),
  UPSTASH_VECTOR_REST_TOKEN: Joi.string().required(),
  UPSTASH_VECTOR_REST_READONLY_TOKEN: Joi.string().required(),
  UPSTASH_VECTOR_REST_URL: Joi.string().uri().required(),
  BLOB_READ_WRITE_TOKEN: Joi.string().required(),
  GROQ_API_KEY: Joi.string().required(),
  XAI_API_KEY: Joi.string().required(),
}).unknown(true); // Allow unknown keys as other env vars might exist

export const validateEnv = () => {
  const { error } = envSchema.validate(process.env);
  if (error) {
    throw new Error(`Environment variable validation error: ${error.message}`);
  }
  console.log('Environment variables validated successfully.');
};