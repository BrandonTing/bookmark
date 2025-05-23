import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
  ],
  source: {
    define: {
      'import.meta.env.SUPABASE_KEY': JSON.stringify(
        process.env.SUPABASE_KEY ?? '',
      ),
    }
  }
});
