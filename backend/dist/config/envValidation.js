"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const joi_1 = __importDefault(require("joi"));
const envSchema = joi_1.default.object({
    PORT: joi_1.default.number().default(3000),
    POSTGRES_URL: joi_1.default.string().required(),
    POSTGRES_USER: joi_1.default.string().required(),
    POSTGRES_HOST: joi_1.default.string().required(),
    SUPABASE_JWT_SECRET: joi_1.default.string().required(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: joi_1.default.string().required(),
    POSTGRES_PRISMA_URL: joi_1.default.string().required(),
    POSTGRES_PASSWORD: joi_1.default.string().required(),
    POSTGRES_DATABASE: joi_1.default.string().required(),
    SUPABASE_URL: joi_1.default.string().uri().required(),
    NEXT_PUBLIC_SUPABASE_URL: joi_1.default.string().uri().required(),
    SUPABASE_SERVICE_ROLE_KEY: joi_1.default.string().required(),
    POSTGRES_URL_NON_POOLING: joi_1.default.string().required(),
    NEXT_PUBLIC_FACEBOOK_APP_ID: joi_1.default.string().required(),
    FACEBOOK_APP_SECRET: joi_1.default.string().required(),
    OPENAI_API_KEY: joi_1.default.string().required(),
    GEMINI_API_KEY: joi_1.default.string().required(),
    CLOUDINARY_CLOUD_NAME: joi_1.default.string().required(),
    CLOUDINARY_API_KEY: joi_1.default.string().required(),
    CLOUDINARY_API_SECRET: joi_1.default.string().required(),
    KV_URL: joi_1.default.string().uri().required(),
    KV_REST_API_URL: joi_1.default.string().uri().required(),
    KV_REST_API_TOKEN: joi_1.default.string().required(),
    KV_REST_API_READ_ONLY_TOKEN: joi_1.default.string().required(),
    REDIS_URL: joi_1.default.string().uri().required(),
    UPSTASH_VECTOR_REST_TOKEN: joi_1.default.string().required(),
    UPSTASH_VECTOR_REST_READONLY_TOKEN: joi_1.default.string().required(),
    UPSTASH_VECTOR_REST_URL: joi_1.default.string().uri().required(),
    BLOB_READ_WRITE_TOKEN: joi_1.default.string().required(),
    GROQ_API_KEY: joi_1.default.string().required(),
    XAI_API_KEY: joi_1.default.string().required(),
}).unknown(true); // Allow unknown keys as other env vars might exist
const validateEnv = () => {
    const { error } = envSchema.validate(process.env);
    if (error) {
        throw new Error(`Environment variable validation error: ${error.message}`);
    }
    console.log('Environment variables validated successfully.');
};
exports.validateEnv = validateEnv;
