import { addMonths, subMonths } from 'date-fns';
import type { Ref } from 'vue';
import type { UserGameDto } from '~/types/user-api';
import { aggregateBrandStats } from '~/utils/userGameBrandStats';

export type SelectedMonth = {
  year: number;
  month: number;
};

function currentMonth(): SelectedMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function shiftMonth(selected: SelectedMonth, delta: number): SelectedMonth {
  const date = new Date(selected.year, selected.month - 1, 1);
  const next = delta >= 0 ? addMonths(date, delta) : subMonths(date, Math.abs(delta));
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

export function useUserGameBrandStats(games: Ref<UserGameDto[]>) {
  const selectedMonth = ref<SelectedMonth>(currentMonth());

  const prevMonth = () => {
    selectedMonth.value = shiftMonth(selectedMonth.value, -1);
  };

  const nextMonth = () => {
    selectedMonth.value = shiftMonth(selectedMonth.value, 1);
  };

  const monthLabel = computed(
    () => `${selectedMonth.value.year} 年 ${selectedMonth.value.month} 月`,
  );

  const stats = computed(() =>
    aggregateBrandStats(games.value, selectedMonth.value.year, selectedMonth.value.month),
  );

  return { selectedMonth, prevMonth, nextMonth, monthLabel, stats };
}
