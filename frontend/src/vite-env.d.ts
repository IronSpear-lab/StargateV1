/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // lägg till fler miljövariabler här
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}