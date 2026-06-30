import { loadErogsGameAutocomplete } from '../utils/erogsGameAutocomplete';

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  const filePath = config.gameErogsAutocompleteFile?.trim();
  if (!filePath) {
    console.warn('[erogs-game-autocomplete] NUXT_GAME_EROGS_AUTOCOMPLETE_FILE 未設定，略過載入');
    return;
  }

  try {
    await loadErogsGameAutocomplete(filePath);
    console.info(`[erogs-game-autocomplete] 已載入：${filePath}`);
  } catch (err) {
    console.error('[erogs-game-autocomplete] 載入失敗', err);
  }
});
