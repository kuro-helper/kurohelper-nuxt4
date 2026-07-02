<template>
  <v-container max-width="lg" class="py-6 py-md-10 px-4">
    <div class="d-flex flex-column ga-2 mb-6">
      <h1 class="text-h4 font-weight-bold tracking-tight">Galgame 資料查詢</h1>
      <p class="text-body-1 text-medium-emphasis">
        以遊戲、品牌、角色、創作者與音樂為維度快速檢索，支援來源與列表模式切換。
      </p>
      <div class="d-flex flex-wrap ga-2">
        <v-chip variant="flat" class="hero-chip" size="small">批評空間</v-chip>
        <v-chip variant="flat" class="hero-chip" size="small">VNDB</v-chip>
        <v-chip variant="flat" class="hero-chip" size="small">Bangumi</v-chip>
      </div>
    </div>

    <div class="rounded-xl overflow-hidden" style="border: 1px solid rgb(var(--v-theme-outline))">
      <div class="tabs-bar px-md-4 px-2 pt-2">
        <v-tabs v-model="tab" color="primary" show-arrows>
          <v-tab v-for="(item, i) in tabItems" :key="item.type" :value="i">
            {{ item.label }}
          </v-tab>
        </v-tabs>
      </div>

      <v-window v-model="tab" class="pa-4 pa-md-4">
        <v-window-item v-for="(item, i) in tabItems" :key="item.type" :value="i">
          <div class="py-2">
            <SectionInput
              placeholder="請輸入關鍵字"
              :type="item.type"
              resource-options
              list-options
              @submit="(payload) => handleSubmit(item.type, payload)"
            />
          </div>
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const tabItems = [
  { type: 'game' as const, label: '查詢遊戲' },
  { type: 'brand' as const, label: '查詢公司品牌' },
  { type: 'character' as const, label: '查詢角色' },
  { type: 'creator' as const, label: '查詢創作者' },
  { type: 'music' as const, label: '查詢音樂' },
];

const tab = ref(0);

type SubmitPayload = {
  keyword: string;
  source?: string | null;
  isListSearch: boolean;
};

const handleSubmit = (type: string, payload: SubmitPayload) => {
  if (!payload.keyword) return;
  console.log('搜尋類型:', type);
  console.log('搜尋參數:', payload);
};
</script>

<style scoped>
.tabs-bar {
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.hero-chip.v-chip {
  border: none !important;
  background-color: rgb(var(--v-theme-surface-variant)) !important;
  color: rgb(var(--v-theme-on-surface-variant)) !important;
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.1);
}
</style>

<style>
.v-theme--light .hero-chip.v-chip {
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-on-surface), 0.12);
}
</style>
