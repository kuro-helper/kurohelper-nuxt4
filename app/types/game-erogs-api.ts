export type ErogsGameAutocompleteItem = {
  id: number;
  name: string;
  category: string;
};

export type ErogsGameAutocompleteResponse = {
  data: ErogsGameAutocompleteItem[];
};

/** Vuetify v-autocomplete `#item` 的 list item 外殼；業務資料在 `raw`。 */
export type VuetifyErogsAutocompleteSlotItem = {
  raw: ErogsGameAutocompleteItem;
};

/** `#item` 傳外殼、`#selection`（return-object）可能傳整筆遊戲物件。 */
export type ErogsAutocompleteSlotInput =
  | VuetifyErogsAutocompleteSlotItem
  | ErogsGameAutocompleteItem;
