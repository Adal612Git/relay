import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  getToken,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';

interface FirebaseRuntime {
  app: FirebaseApp | null;
  appCheckReady: boolean;
  missing: string[];
  verifyAppCheck: () => Promise<void>;
}

let app: FirebaseApp | null = null;
let appCheck: AppCheck | null = null;

export function getFirebaseRuntime(): FirebaseRuntime {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const required = ['apiKey', 'projectId', 'appId'] as const;
  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0)
    return {
      app: null,
      appCheckReady: false,
      missing,
      verifyAppCheck: async () => {
        throw new Error('Firebase is not configured.');
      },
    };

  app = getApps().length > 0 ? getApp() : initializeApp(config);

  const siteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (siteKey && !appCheck) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch {
      // Keep on-device analysis and manual review available if App Check fails to initialize.
      appCheck = null;
    }
  }

  return {
    app,
    appCheckReady: Boolean(appCheck),
    missing: [],
    verifyAppCheck: async () => {
      if (!appCheck) throw new Error('App Check is not configured.');
      const result = await getToken(appCheck);
      if (!result.token) throw new Error('App Check attestation failed.');
    },
  };
}
