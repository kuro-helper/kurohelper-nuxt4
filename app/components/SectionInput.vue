<template>
  <div class="d-flex flex-column align-center w-100">
    <v-card class="mx-auto w-100 mt-6 mt-md-12" max-width="760">
      <v-card-text class="pa-4 pa-md-8">
        <div class="text-subtitle-1 mb-4 font-weight-semibold">輸入關鍵字開始查詢</div>

        <div class="d-flex align-center w-100 ga-2">
          <v-text-field
            v-model="text"
            density="comfortable"
            variant="outlined"
            hide-details="auto"
            :placeholder="placeholder"
            @keydown.enter.prevent="handleSubmit"
          />
          <v-btn
            color="primary"
            icon
            class="flex-shrink-0"
            size="large"
            width="48"
            height="48"
            @click="handleSubmit"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>

        <div
          class="d-flex flex-column flex-sm-row align-stretch align-sm-center w-100 mt-4"
          style="gap: 12px"
        >
          <v-select
            v-if="resourceOptions"
            v-model="selectedSource"
            :items="availableSources"
            label="選擇來源"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            clearable
            class="flex-sm-grow-1"
          />

          <v-checkbox v-if="listOptions" v-model="isListSearch" hide-details label="列表搜尋" />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
type SearchType = 'game' | 'brand' | 'character' | 'creator' | 'music';

export type SubmitPayload = {
  keyword: string;
  source?: string | null;
  isListSearch: boolean;
};

const props = defineProps<{
  placeholder: string;
  resourceOptions: boolean;
  listOptions: boolean;
  type: SearchType;
}>();

const emit = defineEmits<{
  submit: [payload: SubmitPayload];
}>();

const text = ref('');
const isListSearch = ref(false);
const selectedSource = ref<string | undefined>(undefined);

const availableSources = computed(() => {
  switch (props.type) {
    case 'game':
    case 'brand':
      return ['批評空間', 'VNDB'];
    case 'character':
      return ['批評空間', 'VNDB', 'Bangumi'];
    case 'creator':
      return ['批評空間'];
    case 'music':
    default:
      return ['批評空間'];
  }
});

watch(
  () => props.type,
  () => {
    selectedSource.value = undefined;
  },
);

const handleSubmit = () => {
  const keyword = text.value.trim();
  if (!keyword) return;
  emit('submit', {
    keyword,
    source: selectedSource.value ?? null,
    isListSearch: isListSearch.value,
  });
};
</script>
