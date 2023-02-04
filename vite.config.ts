import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { defineConfig } from 'vite';

type EntryReference = Record<string, string>;

export async function getAllEntries(): Promise<EntryReference> {
  const srcEntriesPath = resolve(__dirname, 'src/entries');
  const files = await readdir(srcEntriesPath);

  return files
    .filter((filename) => filename.endsWith('.ts'))
    .reduce((entries, filename) => ({
      ...entries,
      [filename]: resolve(srcEntriesPath, filename),
    }), {});
}

export default defineConfig(async ({ command, mode }) => {
  const rollupInput = await getAllEntries();

  return {
    build: {
      manifest: true,
      rollupOptions: {
        input: rollupInput,
      },
    },
  };
});
