<template>
  <v-sheet rounded="xl" border color="surface-variant" class="brand-chart pa-5">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div class="text-subtitle-2">品牌統計</div>
      <v-btn-toggle
        v-model="chartMode"
        mandatory
        density="compact"
        variant="flat"
        class="brand-chart__mode-toggle"
      >
        <v-btn value="overview" size="small" class="brand-chart__mode-btn">總覽</v-btn>
        <v-btn value="month" size="small" class="brand-chart__mode-btn">月份</v-btn>
      </v-btn-toggle>
    </div>

    <div class="brand-chart__nav d-flex align-center justify-center ga-2 mb-4">
      <v-btn
        icon="mdi-chevron-left"
        variant="tonal"
        size="small"
        rounded="xl"
        aria-label="上一個月"
        :disabled="isOverview"
        @click="prevMonth"
      />
      <span class="text-body-1 font-weight-medium text-no-wrap">{{ periodLabel }}</span>
      <v-btn
        icon="mdi-chevron-right"
        variant="tonal"
        size="small"
        rounded="xl"
        aria-label="下一個月"
        :disabled="isOverview"
        @click="nextMonth"
      />
    </div>

    <v-sheet
      v-if="stats.total === 0"
      rounded="lg"
      border
      color="surface"
      class="brand-chart__empty pa-8 text-center"
    >
      <p class="text-body-2 text-medium-emphasis mb-0">{{ periodLabel }} 沒有遊玩完畢的遊戲</p>
    </v-sheet>

    <ClientOnly v-else>
      <VChart class="brand-chart__canvas" :option="chartOption" autoresize />
    </ClientOnly>

    <p v-if="stats.total > 0" class="text-body-2 text-medium-emphasis text-center mb-0 mt-4">
      共 {{ stats.total }} 款 · {{ stats.brandCount }} 個品牌
    </p>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, toRef } from 'vue';
import { useDisplay } from 'vuetify';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { UserGameDto } from '~/types/user-api';
import { useChartTheme } from '~/composables/useChartTheme';
import { useUserGameBrandStats, type BrandChartMode } from '~/composables/useUserGameBrandStats';
import type { BrandStatGame } from '~/utils/userGameBrandStats';
import { formatUserGameDate } from '~/utils/userGameDate';

const VChart = defineAsyncComponent(() => import('vue-echarts'));

type PieDatum = {
  name: string;
  value: number;
  games: BrandStatGame[];
  isOthers?: boolean;
};

const props = defineProps<{
  games: UserGameDto[];
}>();

const chartMode = ref<BrandChartMode>('overview');
const isOverview = computed(() => chartMode.value === 'overview');

const { smAndDown } = useDisplay();
const { chartColors, textColor, emphasisShadowColor } = useChartTheme();
const gamesRef = toRef(props, 'games');
const { prevMonth, nextMonth, monthLabel, stats } = useUserGameBrandStats(gamesRef, chartMode);

const periodLabel = computed(() => (isOverview.value ? '總覽' : monthLabel.value));

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatTooltip(params: CallbackDataParams): string {
  const data = params.data as PieDatum;
  const rows = data.games
    .map((game) => {
      const name = escapeHtml(game.name);
      const finished = escapeHtml(formatUserGameDate(game.finishedDate));
      const brand = data.isOthers
        ? `<span class="brand-chart-tooltip__brand">${escapeHtml(game.brandName)}</span>`
        : '';
      return [
        `<div class="brand-chart-tooltip__row">`,
        `<div class="brand-chart-tooltip__meta">`,
        `<span class="brand-chart-tooltip__game">${name}</span>`,
        brand,
        `</div>`,
        `<span class="brand-chart-tooltip__date">${finished}</span>`,
        `</div>`,
      ].join('');
    })
    .join('');

  return [
    `<div class="brand-chart-tooltip__card">`,
    `<div class="brand-chart-tooltip__header">`,
    `<span class="brand-chart-tooltip__title">${escapeHtml(data.name)}</span>`,
    `<span class="brand-chart-tooltip__count">${data.games.length} 款</span>`,
    `</div>`,
    `<div class="brand-chart-tooltip__list">${rows}</div>`,
    `</div>`,
  ].join('');
}

const chartOption = computed<EChartsOption>(() => {
  const legendBottom = smAndDown.value;
  const onSurface = textColor.value;

  return {
    color: chartColors.value,
    tooltip: {
      trigger: 'item',
      confine: true,
      enterable: true,
      appendToBody: true,
      className: 'brand-chart-tooltip',
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      extraCssText: 'box-shadow:none;border:none;padding:0;background:transparent;',
      formatter: (params) => formatTooltip(params as CallbackDataParams),
      textStyle: { color: onSurface },
    },
    legend: {
      type: 'scroll',
      orient: legendBottom ? 'horizontal' : 'vertical',
      right: legendBottom ? undefined : '2%',
      left: legendBottom ? 'center' : undefined,
      top: legendBottom ? undefined : 'middle',
      bottom: legendBottom ? 0 : undefined,
      textStyle: { color: onSurface },
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: legendBottom ? ['50%', '42%'] : ['38%', '50%'],
        data: stats.value.items.map(
          (item): PieDatum => ({
            name: item.name,
            value: item.value,
            games: item.games,
            isOthers: item.isOthers,
          }),
        ),
        label: {
          color: onSurface,
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: emphasisShadowColor.value,
          },
        },
      },
    ],
  };
});
</script>

<style scoped>
.brand-chart__mode-toggle.v-btn-toggle {
  height: auto;
  padding: 3px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.brand-chart__mode-toggle .brand-chart__mode-btn.v-btn {
  border-radius: 999px !important;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.7);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.brand-chart__mode-toggle .brand-chart__mode-btn.v-btn--active {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.brand-chart__canvas {
  width: 100%;
  height: 200px;
}

@media (min-width: 600px) {
  .brand-chart__canvas {
    height: 220px;
  }
}
</style>

<style>
.brand-chart-tooltip {
  pointer-events: auto !important;
}

.brand-chart-tooltip .brand-chart-tooltip__card {
  min-width: 220px;
  max-width: min(320px, calc(100vw - 32px));
  max-height: 280px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-outline), 0.45);
  background: rgb(var(--v-theme-surface));
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 12px 28px rgba(0, 0, 0, 0.16);
  font-family:
    'Geist Sans',
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.brand-chart-tooltip .brand-chart-tooltip__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.28);
}

.brand-chart-tooltip .brand-chart-tooltip__title {
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.35;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-chart-tooltip .brand-chart-tooltip__count {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.14);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.brand-chart-tooltip .brand-chart-tooltip__list {
  padding: 6px 6px 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.brand-chart-tooltip .brand-chart-tooltip__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 7px 8px;
  border-radius: 8px;
}

.brand-chart-tooltip .brand-chart-tooltip__row:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.brand-chart-tooltip .brand-chart-tooltip__meta {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-chart-tooltip .brand-chart-tooltip__game {
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-chart-tooltip .brand-chart-tooltip__brand {
  min-width: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
  color: rgba(var(--v-theme-on-surface), 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-chart-tooltip .brand-chart-tooltip__date {
  flex: none;
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
</style>
