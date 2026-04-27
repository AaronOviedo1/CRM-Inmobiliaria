/// Acceso tipado y con defaults seguros a variables de entorno.
///
/// Regla: NUNCA leer `process.env.X` directamente fuera de este archivo.
/// Si una feature depende de un secreto opcional, expone un `isXConfigured()`
/// en lugar de hacer al consumidor chequear `!= ""`.

function get(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function required(name: string): string {
  const v = get(name);
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function bool(name: string, fallback = false): boolean {
  const v = get(name);
  if (v == null) return fallback;
  return v === "true" || v === "1";
}

export const env = {
  // Node
  nodeEnv: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",

  // Database
  databaseUrl: required("DATABASE_URL"),

  // Auth
  authSecret: required("AUTH_SECRET"),
  authUrl: get("AUTH_URL") ?? "http://localhost:3000",
  portalJwtSecret: required("PORTAL_JWT_SECRET"),

  // Email
  resendApiKey: get("RESEND_API_KEY"),
  resendFrom: get("RESEND_FROM") ?? "CRM <no-reply@localhost>",

  // WhatsApp
  whatsappAppId: get("WHATSAPP_APP_ID"),
  whatsappAppSecret: get("WHATSAPP_APP_SECRET"),
  whatsappVerifyToken: get("WHATSAPP_VERIFY_TOKEN"),
  whatsappDefaultPhoneNumberId: get("WHATSAPP_DEFAULT_PHONE_NUMBER_ID"),
  whatsappDefaultAccessToken: get("WHATSAPP_DEFAULT_ACCESS_TOKEN"),
  whatsappTokenEncryptionKey: get("WHATSAPP_TOKEN_ENCRYPTION_KEY"),

  // Uploads
  uploadthingSecret: get("UPLOADTHING_SECRET"),
  uploadthingAppId: get("UPLOADTHING_APP_ID"),

  // Cloudinary
  cloudinaryCloudName: get("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: get("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: get("CLOUDINARY_API_SECRET"),
  cloudinaryUploadFolder: get("CLOUDINARY_UPLOAD_FOLDER"),

  // Maps
  mapboxToken: get("MAPBOX_ACCESS_TOKEN"),
  googleMapsKey: get("GOOGLE_MAPS_API_KEY"),

  // Upstash
  upstashUrl: get("UPSTASH_REDIS_REST_URL"),
  upstashToken: get("UPSTASH_REDIS_REST_TOKEN"),

  // Sentry
  sentryDsn: get("SENTRY_DSN"),

  // Stripe
  stripeSecret: get("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: get("STRIPE_WEBHOOK_SECRET"),
  stripePrices: {
    STARTER: get("STRIPE_PRICE_STARTER"),
    PROFESSIONAL: get("STRIPE_PRICE_PROFESSIONAL"),
    ENTERPRISE: get("STRIPE_PRICE_ENTERPRISE"),
  },

  // reCAPTCHA
  recaptchaSecret: get("RECAPTCHA_SECRET_KEY"),

  // Cron
  cronSecret: required("CRON_SECRET"),

  // Feature flags
  featureSmsBackup: bool("FEATURE_SMS_BACKUP"),
  featureWhatsappAutopilot: bool("FEATURE_WHATSAPP_AUTOPILOT"),

  // Misc
  defaultTimezone: get("DEFAULT_TIMEZONE") ?? "America/Hermosillo",
};

// Helpers de "feature está configurada" — los servicios los usan para decidir
// si pueden operar o si deben caer a no-op.

export const isResendConfigured = () => Boolean(env.resendApiKey);
export const isWhatsappGlobalConfigured = () =>
  Boolean(
    env.whatsappAppId &&
      env.whatsappVerifyToken &&
      env.whatsappTokenEncryptionKey,
  );
export const isUploadthingConfigured = () =>
  Boolean(env.uploadthingSecret && env.uploadthingAppId);
export const isCloudinaryConfigured = () =>
  Boolean(
    env.cloudinaryCloudName &&
      env.cloudinaryApiKey &&
      env.cloudinaryApiSecret,
  );
export const isMapboxConfigured = () => Boolean(env.mapboxToken);
export const isGoogleMapsConfigured = () => Boolean(env.googleMapsKey);
export const isGeocodingConfigured = () =>
  isMapboxConfigured() || isGoogleMapsConfigured();
export const isUpstashConfigured = () =>
  Boolean(env.upstashUrl && env.upstashToken);
export const isStripeConfigured = () =>
  Boolean(env.stripeSecret && env.stripeWebhookSecret);
export const isRecaptchaConfigured = () => Boolean(env.recaptchaSecret);
