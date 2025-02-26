/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_CDN_URL: string;
  readonly VITE_REMIQ_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
