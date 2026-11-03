import { watch } from 'chokidar';
import { resolve } from 'node:path';
import { loadErogsGameAutocomplete } from '../utils/erogsGameAutocomplete';

export default defineNitroPlugin(async (nitroApp) => {
  const filePath = useRuntimeConfig().gameErogsAutocompleteFile?.trim();
  if (!filePath) {
    console.warn('[erogs-game-autocomplete] NUXT_GAME_EROGS_AUTOCOMPLETE_FILE 未設定，略過載入');
    return;
  }

  const absPath = resolve(process.cwd(), filePath);
  let pending = false;
  let loading: Promise<void> | undefined;
  let closing = false;

  function reload(): Promise<void> {
    pending = true;
    if (!loading) {
      loading = (async () => {
        while (pending && !closing) {
          pending = false;
          try {
            await loadErogsGameAutocomplete(absPath);
            console.info(`[erogs-game-autocomplete] 已載入：${absPath}`);
          } catch (err) {
            console.error('[erogs-game-autocomplete] 載入失敗，保留現有快取', err);
          }
        }
      })().finally(() => {
        loading = undefined;
      });
    }
    return loading;
  }

  const watcher = watch(absPath, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });
  watcher.on('add', () => void reload());
  watcher.on('change', () => void reload());
  watcher.on('error', (err) => console.error('[erogs-game-autocomplete] 檔案監控失敗', err));
  nitroApp.hooks.hook('close', async () => {
    closing = true;
    await watcher.close();
    await loading;
  });

  // Wait for the initial scan so subsequent file changes cannot be missed.
  await new Promise<void>((resolveReady) => {
    watcher.once('ready', resolveReady);
    watcher.once('error', () => resolveReady());
  });
  await reload();
});
