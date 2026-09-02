<template>
  <v-sheet rounded="xl" border color="surface-variant" class="brand-chart pa-5">
    <div class="text-subtitle-2 mb-4">品牌統計</div>

    <div class="brand-chart__nav d-flex align-center justify-center ga-2 mb-4">
      <v-btn
        icon="mdi-chevron-left"
        variant="tonal"
        size="small"
        rounded="xl"
        aria-label="上一個月"
        @click="prevMonth"
      />
      <span class="text-body-1 font-weight-medium text-no-wrap">{{ monthLabel }}</span>
      <v-btn
        icon="mdi-chevron-right"
        variant="tonal"
        size="small"
        rounded="xl"
        aria-label="下一個月"
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
      <p class="text-body-2 text-medium-emphasis mb-0">{{ monthLabel }} 沒有遊玩完畢的遊戲</p>
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
import { computed, toRef } from 'vue';
import { useDisplay } from 'vuetify';
import type { EChartsOption } from 'echarts';
import type { UserGameDto } from '~/types/user-api';
import { useChartTheme } from '~/composables/useChartTheme';
import { useUserGameBrandStats } from '~/composables/useUserGameBrandStats';

const props = defineProps<{
  games: UserGameDto[];
}>();

const { smAndDown } = useDisplay();
const { chartColors, textColor, tooltipBackgroundColor, tooltipBorderColor, emphasisShadowColor } =
  useChartTheme();
const gamesRef = toRef(props, 'games');
const { prevMonth, nextMonth, monthLabel, stats } = useUserGameBrandStats(gamesRef);

const chartOption = computed<EChartsOption>(() => {
  const legendBottom = smAndDown.value;
  const onSurface = textColor.value;

  return {
    color: chartColors.value,
    tooltip: {
      trigger: 'item',
      formatter: '{b} · {c} 款 · {d}%',
      backgroundColor: tooltipBackgroundColor.value,
      borderColor: tooltipBorderColor.value,
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
        data: stats.value.items.map((item) => ({
          name: item.name,
          value: item.value,
        })),
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
