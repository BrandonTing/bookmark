/// <reference types="@rsbuild/core/types" />
interface ImportMetaEnv {
  // import.meta.env.PUBLIC_FOO
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


