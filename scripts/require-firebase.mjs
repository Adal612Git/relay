import { loadEnv } from 'vite';

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_RECAPTCHA_ENTERPRISE_SITE_KEY',
];
const config = loadEnv('development', process.cwd(), 'VITE_');
const missing = required.filter((key) => !config[key]?.trim());
if (missing.length) {
  console.error(
    `BLOCKED: real Firebase integration needs ${missing.join(', ')} in .env.local or the process environment. No request was sent.`,
  );
  process.exit(2);
}
console.log(
  'Firebase public configuration is present. This does not verify attestation or model availability.',
);
