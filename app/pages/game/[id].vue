<template>
  <v-container max-width="md" class="py-8 px-4">
    <v-card
      variant="outlined"
      class="rounded-xl overflow-hidden"
      style="
        background: linear-gradient(
          160deg,
          rgba(255, 255, 255, 0.06) 0%,
          rgba(255, 255, 255, 0.015) 100%
        );
      "
    >
      <v-card-text class="pa-6 pa-md-8">
        <div class="text-overline text-medium-emphasis mb-4">Game ID: {{ game.id }}</div>

        <div class="mb-4">
          <h1 class="text-h4 font-weight-bold">{{ game.title }}</h1>
          <p v-if="game.originalTitle" class="text-subtitle-1 text-medium-emphasis mt-1">
            {{ game.originalTitle }}
          </p>
        </div>

        <v-divider class="mb-6" />

        <div class="d-flex flex-wrap ga-2 mb-6">
          <v-chip label>品牌：{{ game.brand }}</v-chip>
          <v-chip label>發售日：{{ game.releaseDate ?? '未知' }}</v-chip>
          <v-chip label>評分：{{ game.score ?? 0 }}</v-chip>
        </div>

        <div class="mb-6">
          <div class="text-subtitle-2 mb-2">支援平台</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip v-for="p in game.platforms" :key="p" variant="outlined">{{ p }}</v-chip>
          </div>
        </div>

        <div class="mb-6">
          <div class="text-subtitle-2 mb-2">類型</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip v-for="g in game.genres" :key="g" color="secondary" variant="outlined">
              {{ g }}
            </v-chip>
          </div>
        </div>

        <div>
          <div class="text-subtitle-2 mb-2">遊戲簡介</div>
          <p class="text-body-1 text-medium-emphasis">{{ game.description }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
type GameDetail = {
  id: string;
  title: string;
  originalTitle?: string;
  brand: string;
  releaseDate?: string;
  platforms: string[];
  genres: string[];
  score?: number;
  description: string;
};

const FALLBACK_BASE: Omit<GameDetail, 'id' | 'title'> = {
  originalTitle: 'Game Original Title',
  brand: 'Brand',
  releaseDate: 'TBA',
  platforms: ['Windows'],
  genres: ['Test', 'Test2'],
  score: 0,
  description: 'This is defalut information.',
};

const route = useRoute();
const idParam = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : (route.params.id?.[0] ?? ''),
);

const game = computed<GameDetail>(() => {
  const id = idParam.value;
  return {
    id,
    title: id ? `Game #${id}` : 'Game Title',
    ...FALLBACK_BASE,
  };
});
</script>
