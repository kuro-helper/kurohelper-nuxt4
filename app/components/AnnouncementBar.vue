<template>
  <div v-if="items.length > 0" class="announcement-fab-wrap">
    <v-menu
      v-model="panelOpen"
      location="bottom end"
      offset="10"
      :close-on-content-click="false"
      transition="slide-y-transition"
      content-class="announcement-menu-content"
      @update:model-value="onPanelOpenUpdate"
    >
      <template #activator="{ props: menuProps }">
        <v-tooltip text="公告" location="left">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="{ ...menuProps, ...tooltipProps }"
              class="announcement-fab"
              color="primary"
              variant="flat"
              size="large"
              icon
              aria-label="開啟公告"
            >
              <v-badge :content="items.length" color="error" floating overlap>
                <v-icon>mdi-bullhorn-outline</v-icon>
              </v-badge>
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <v-card rounded="xl" variant="flat" color="surface" class="announcement-panel">
        <div class="announcement-panel__header">
          <span class="text-subtitle-2 font-weight-bold">公告</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            aria-label="關閉公告"
            @click="panelOpen = false"
          />
        </div>

        <div class="announcement-panel__list">
          <button
            v-for="item in visibleItems"
            :key="item.id"
            type="button"
            class="announcement-item"
            @click="openDetail(item)"
          >
            <v-avatar size="36" rounded="lg" class="announcement-item__icon">
              <v-icon size="20" color="primary">{{ item.icon || 'mdi-bullhorn-outline' }}</v-icon>
            </v-avatar>

            <div class="announcement-item__body">
              <div class="announcement-item__meta">
                <v-chip size="x-small" variant="tonal" color="primary" label>
                  {{ item.category }}
                </v-chip>
                <span class="text-caption text-medium-emphasis text-no-wrap">
                  {{ fmtDate(item.createdAt) }}
                </span>
              </div>
              <p class="announcement-item__preview text-body-2">
                {{ item.title }}
              </p>
            </div>
          </button>
        </div>

        <div v-if="hasMore" class="announcement-panel__more">
          <v-btn
            variant="text"
            size="small"
            block
            class="text-none"
            :prepend-icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="expanded = !expanded"
          >
            {{ expanded ? '收合' : `看更多（還有 ${hiddenCount} 則）` }}
          </v-btn>
        </div>
      </v-card>
    </v-menu>

    <v-dialog v-model="detailOpen" max-width="520" opacity="0.58" scroll-strategy="block">
      <v-card
        v-if="active"
        rounded="xl"
        variant="flat"
        color="surface"
        class="announcement-detail-card"
      >
        <div class="announcement-detail__header">
          <v-avatar size="36" rounded="lg" class="announcement-item__icon">
            <v-icon size="20" color="primary">{{ active.icon || 'mdi-bullhorn-outline' }}</v-icon>
          </v-avatar>

          <div class="announcement-detail__heading">
            <h2 class="announcement-detail__title">{{ active.title }}</h2>
            <div class="announcement-detail__meta">
              <v-chip size="x-small" variant="tonal" color="primary" label>
                {{ active.category }}
              </v-chip>
              <time class="announcement-detail__date" :datetime="active.createdAt">
                {{ fmtDate(active.createdAt) }}
              </time>
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            class="announcement-detail__close"
            aria-label="關閉"
            @click="detailOpen = false"
          />
        </div>

        <div class="announcement-detail__body">
          <MarkdownContent :source="active.content" />
          <v-img
            v-if="active.image"
            :src="active.image"
            max-height="240"
            contain
            class="announcement-detail__image rounded-lg"
          />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { AnnouncementItem, AnnouncementListResponse } from '~/types/announcement-api';

const DEFAULT_VISIBLE = 3;

const props = defineProps<{
  /** 傳入時只撈該分類；省略則全部 */
  category?: string;
}>();

const query = computed(() => {
  const category = props.category?.trim();
  return category ? { category } : {};
});

const { data, refresh } = useFetch<AnnouncementListResponse>('/api/announcement', {
  query,
  lazy: true,
  default: () => ({ message: '', data: [] }),
});

const REFRESH_COOLDOWN_MS = 60_000;
/** 上次因開面板而更新的時間；進頁 lazy fetch 視為剛更新過 */
const lastPanelRefreshAt = ref(Date.now());

const items = computed(() => data.value?.data ?? []);
const panelOpen = ref(false);
const expanded = ref(false);
const detailOpen = ref(false);
const active = ref<AnnouncementItem | null>(null);

function onPanelOpenUpdate(open: boolean) {
  if (!open) {
    expanded.value = false;
    return;
  }

  const now = Date.now();
  if (now - lastPanelRefreshAt.value < REFRESH_COOLDOWN_MS) return;
  lastPanelRefreshAt.value = now;
  void refresh();
}

const hasMore = computed(() => items.value.length > DEFAULT_VISIBLE);
const hiddenCount = computed(() => Math.max(0, items.value.length - DEFAULT_VISIBLE));
const visibleItems = computed(() =>
  expanded.value ? items.value : items.value.slice(0, DEFAULT_VISIBLE),
);

function openDetail(item: AnnouncementItem) {
  active.value = item;
  detailOpen.value = true;
}

function fmtDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
</script>

<style scoped>
.announcement-fab-wrap {
  position: fixed;
  top: 72px;
  right: 20px;
  z-index: 35;
}

.announcement-fab {
  color: rgb(var(--v-theme-on-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.55) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;
  border: 1px solid rgba(var(--v-theme-on-primary), 0.22);
}

.announcement-fab:hover {
  background: rgba(var(--v-theme-primary), 0.72) !important;
}

.announcement-panel {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.announcement-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 6px 14px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.35);
  flex-shrink: 0;
}

.announcement-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  overflow: hidden;
  min-width: 0;
}

.announcement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.5);
  background: rgba(var(--v-theme-surface-variant), 0.35);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.announcement-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.08);
}

.announcement-item__icon {
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-theme-outline), 0.4);
  background: rgba(var(--v-theme-primary), 0.12);
}

.announcement-item__body {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
}

.announcement-item__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
  min-width: 0;
}

.announcement-item__preview {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.announcement-panel__more {
  padding: 0 8px 8px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.25);
  flex-shrink: 0;
}

.announcement-detail__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 14px 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.35);
}

.announcement-detail__heading {
  flex: 1 1 0;
  min-width: 0;
  padding-top: 1px;
}

.announcement-detail__title {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.announcement-detail__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.announcement-detail__date {
  font-size: 0.75rem;
  line-height: 1;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.announcement-detail__close {
  margin-top: -2px;
  flex-shrink: 0;
}

.announcement-detail__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px 18px;
  max-height: min(70vh, 560px);
  overflow-y: auto;
}

.announcement-detail__image {
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
}
</style>

<style>
.announcement-menu-content {
  width: min(360px, calc(100vw - 32px)) !important;
  max-width: min(360px, calc(100vw - 32px)) !important;
  overflow: hidden !important;
}

.announcement-panel.v-card {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.65);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28) !important;
}

.v-theme--light .announcement-panel.v-card {
  border-color: rgba(var(--v-theme-outline), 0.85);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.16) !important;
}

.announcement-detail-card.v-card {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45) !important;
}

.v-theme--light .announcement-detail-card.v-card {
  border-color: rgba(var(--v-theme-outline), 0.85);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18) !important;
}
</style>
