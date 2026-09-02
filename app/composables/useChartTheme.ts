import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { resolveChartThemeTokens } from '~/config/chartTheme';
import { hexToRgba, themeColorToString } from '~/utils/chartColor';

const CHART_COLOR_KEYS = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

const EMPHASIS_SHADOW_COLOR = '#000000';

export function useChartTheme() {
  const theme = useTheme();

  const tokens = computed(() => resolveChartThemeTokens(theme.global.name.value));

  const themeColors = computed(() => theme.global.current.value.colors);

  const chartColors = computed((): string[] =>
    CHART_COLOR_KEYS.map((key) => themeColorToString(themeColors.value[key])),
  );

  const textColor = computed((): string => themeColorToString(themeColors.value['on-surface']));

  const surfaceColor = computed((): string => themeColorToString(themeColors.value.surface));

  const outlineColor = computed((): string => themeColorToString(themeColors.value.outline));

  const tooltipBackgroundColor = computed((): string =>
    hexToRgba(surfaceColor.value, tokens.value.tooltipSurfaceAlpha),
  );

  const tooltipBorderColor = computed((): string =>
    hexToRgba(outlineColor.value, tokens.value.tooltipOutlineAlpha),
  );

  const emphasisShadowColor = computed((): string =>
    hexToRgba(EMPHASIS_SHADOW_COLOR, tokens.value.emphasisShadowAlpha),
  );

  return {
    chartColors,
    textColor,
    tooltipBackgroundColor,
    tooltipBorderColor,
    emphasisShadowColor,
  };
}
