import { z } from "zod";

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.email().optional(),
);

const optionalPassword = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(8).optional(),
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalPositiveInt = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

const optionalPort = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().min(1).max(65535).optional(),
);

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_LOGIN_EMAIL: optionalEmail,
  ADMIN_LOGIN_PASSWORD: optionalPassword,
  ADMIN_LOGIN_NAME: z.string().trim().min(2).max(80).default("Platform Admin"),
  APP_URL: z.url().default("http://localhost:3000"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  BUNNY_STREAM_LIBRARY_ID: optionalPositiveInt,
  BUNNY_STREAM_API_KEY: optionalText,
  BUNNY_STREAM_EMBED_TOKEN_KEY: optionalText,
  BUNNY_STREAM_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).max(86400).default(3600),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
  SMTP_HOST: optionalText,
  SMTP_PORT: optionalPort,
  SMTP_USER: optionalText,
  SMTP_PASS: optionalText,
  SMTP_FROM: optionalText,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Environment variable validation failed");
}

export const env = parsed.data;

export const adminLoginConfig = {
  email: env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() ?? null,
  password: env.ADMIN_LOGIN_PASSWORD ?? null,
  name: env.ADMIN_LOGIN_NAME,
};

