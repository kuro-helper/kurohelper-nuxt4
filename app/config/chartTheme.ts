import type { AppThemeName } from '~/composables/useAppTheme';
import { normalizeAppTheme } from '~/composables/useAppTheme';

export type ChartThemeTokens = {
  tooltipSurfaceAlpha: number;
  tooltipOutlineAlpha: number;
  emphasisShadowAlpha: number;
};

export const CHART_THEME_TOKENS: Record<AppThemeName, ChartThemeTokens> = {
  light: {
    tooltipSurfaceAlpha: 0.96,
    tooltipOutlineAlpha: 0.8,
    emphasisShadowAlpha: 0.15,
  },
  dark: {
    tooltipSurfaceAlpha: 0.92,
    tooltipOutlineAlpha: 0.8,
    emphasisShadowAlpha: 0.45,
  },
};

export function resolveChartThemeTokens(themeName: unknown): ChartThemeTokens {
  return CHART_THEME_TOKENS[normalizeAppTheme(themeName)];
}
