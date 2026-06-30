import type {
  ErogsGameAutocompleteItem,
  ErogsGameAutocompleteResponse,
} from '~/types/game-erogs-api';

const DEFAULT_DEBOUNCE_MS = 250;

export function useErogsGameAutocomplete(debounceMs = DEFAULT_DEBOUNCE_MS) {
  const items = ref<ErogsGameAutocompleteItem[]>([]);
  const loading = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
  }

  function reset() {
    clearTimer();
    items.value = [];
    loading.value = false;
  }

  function search(query: string) {
    clearTimer();
    const q = query.trim();

    if (q.length < 2) {
      items.value = [];
      loading.value = false;
      return;
    }

    timer = setTimeout(async () => {
      loading.value = true;
      try {
        const res = await $fetch<ErogsGameAutocompleteResponse>('/api/erogs/games/autocomplete', {
          query: { q },
        });
        items.value = res.data ?? [];
      } catch {
        items.value = [];
      } finally {
        loading.value = false;
      }
    }, debounceMs);
  }

  onUnmounted(reset);

  return { items, loading, search, reset };
}
