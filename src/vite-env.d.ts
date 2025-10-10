/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_API_URL: string;
  }
}

declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
