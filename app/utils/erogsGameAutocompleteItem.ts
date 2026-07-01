import type {
  ErogsAutocompleteSlotInput,
  ErogsGameAutocompleteItem,
  VuetifyErogsAutocompleteSlotItem,
} from '~/types/game-erogs-api';

function isVuetifyErogsAutocompleteSlotItem(
  item: ErogsAutocompleteSlotInput,
): item is VuetifyErogsAutocompleteSlotItem {
  return 'raw' in item;
}

/** 從 Vuetify autocomplete slot 取出 `{ id, name, category }`。 */
export function unwrapErogsAutocompleteItem(
  item: ErogsAutocompleteSlotInput,
): ErogsGameAutocompleteItem {
  if (isVuetifyErogsAutocompleteSlotItem(item)) return item.raw;
  return item;
}
