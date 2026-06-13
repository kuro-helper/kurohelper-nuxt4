<template>
  <v-container max-width="lg" class="py-8 px-4">
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
        <div class="text-overline text-medium-emphasis mb-4">使用者 ID（DB）：{{ user.id }}</div>

        <div class="d-flex ga-4 align-start mb-6">
          <v-avatar size="72" rounded="lg">
            <v-img v-if="user.avatar" :src="user.avatar" alt="" cover />
            <span v-else class="text-h5">{{ initials }}</span>
          </v-avatar>
          <div class="flex-grow-1 min-w-0">
            <h1 class="text-h4 font-weight-bold">{{ user.name }}</h1>
            <div class="text-body-2 text-medium-emphasis mt-2">路由 id：{{ idParam }}</div>
          </div>
        </div>

        <v-sheet rounded="xl" border color="surface-variant" class="pa-5 mb-6">
          <div class="text-subtitle-2 mb-2">說明／簡介</div>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ user.description || '（無）' }}
          </p>
        </v-sheet>

        <v-divider class="mb-6" />

        <div class="d-flex flex-wrap ga-2 mb-6">
          <template v-if="user.discordId">
            <v-chip label color="primary" variant="tonal">Discord：{{ user.discordId }}</v-chip>
          </template>
          <template v-else>
            <v-chip label color="secondary" variant="tonal">尚未綁定 Discord</v-chip>
          </template>
          <v-chip label>角色代碼：{{ user.role }}</v-chip>
          <v-chip label>建立時間：{{ user.createdAt }}</v-chip>
          <v-chip label>更新時間：{{ user.updatedAt }}</v-chip>
        </div>

        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
          <div class="text-subtitle-1 font-weight-bold">遊戲紀錄（UserGame）</div>
          <v-chip size="small" variant="tonal" color="primary"
            >{{ user.userGames.length }} 筆</v-chip
          >
        </div>

        <v-sheet
          v-if="user.userGames.length === 0"
          rounded="xl"
          border
          color="surface-variant"
          class="empty-state pa-8 text-center"
        >
          <v-img :src="PLACEHOLDER_IMAGE_URL" alt="" max-width="120" class="mx-auto mb-4" />
          <p class="text-body-2 text-medium-emphasis mb-0">尚無關聯遊戲資料。</p>
        </v-sheet>

        <div v-else class="game-grid">
          <v-card
            v-for="(ug, idx) in user.userGames"
            :key="`${ug.gameErogsId}-${idx}`"
            rounded="xl"
            variant="outlined"
            class="game-card d-flex flex-column"
          >
            <v-img :src="PLACEHOLDER_IMAGE_URL" height="140" cover class="flex-shrink-0">
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height bg-surface-variant">
                  <v-progress-circular indeterminate color="primary" size="32" />
                </div>
              </template>
            </v-img>

            <v-card-item class="pb-2">
              <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
                Erogs #{{ ug.gameErogsId }}
              </v-card-title>
              <v-card-subtitle class="pa-0 mt-2">
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    size="x-small"
                    :color="ug.status === 1 ? 'success' : 'secondary'"
                    variant="tonal"
                  >
                    {{ statusLabel(ug.status) }}
                  </v-chip>
                  <v-chip
                    v-if="ug.wishListMark"
                    size="x-small"
                    color="pink"
                    variant="tonal"
                    prepend-icon="mdi-heart"
                  >
                    願望清單
                  </v-chip>
                  <v-chip
                    v-if="ug.blackListMark"
                    size="x-small"
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-cancel"
                  >
                    黑名單
                  </v-chip>
                </div>
              </v-card-subtitle>
            </v-card-item>

            <v-card-text class="pt-0 mt-auto">
              <div class="game-meta">
                <div class="game-meta-row">
                  <span class="game-meta-label">開始</span>
                  <span class="game-meta-value">{{ ug.startDate ?? '—' }}</span>
                </div>
                <div class="game-meta-row">
                  <span class="game-meta-label">完食</span>
                  <span class="game-meta-value">{{ ug.finishedDate ?? '—' }}</span>
                </div>
                <div class="game-meta-row">
                  <span class="game-meta-label">建立</span>
                  <span class="game-meta-value text-medium-emphasis">{{ ug.createdAt }}</span>
                </div>
                <div class="game-meta-row">
                  <span class="game-meta-label">更新</span>
                  <span class="game-meta-value text-medium-emphasis">{{ ug.updatedAt }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const PLACEHOLDER_IMAGE_URL = 'https://image.kurohelper.com/docs/neneGIF.gif';

type MockUserGame = {
  userId: number;
  gameErogsId: number;
  status: number;
  wishListMark: boolean;
  blackListMark: boolean;
  startDate?: string | null;
  finishedDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

type MockUser = {
  id: number;
  name: string;
  discordId: string | null;
  avatar: string;
  description: string;
  role: number;
  createdAt: string;
  updatedAt: string;
  userGames: MockUserGame[];
};

const MOCK_USERS: Record<string, MockUser> = {
  '1001': {
    id: 1001,
    name: 'Peter',
    discordId: '123456789012345678',
    avatar: '',
    description: 'KuroHelper 資料維護與內容為主的使用者範例。',
    role: 0,
    createdAt: '2025-05-01T08:00:00+08:00',
    updatedAt: '2026-05-02T14:30:00+08:00',
    userGames: [
      {
        userId: 1001,
        gameErogsId: 88001,
        status: 1,
        wishListMark: false,
        blackListMark: false,
        startDate: '2025-06-01',
        finishedDate: '2025-08-15',
        createdAt: '2025-06-01T10:00:00+08:00',
        updatedAt: '2025-08-15T22:00:00+08:00',
      },
      {
        userId: 1001,
        gameErogsId: 88002,
        status: 0,
        wishListMark: true,
        blackListMark: false,
        createdAt: '2026-01-10T09:00:00+08:00',
        updatedAt: '2026-01-10T09:00:00+08:00',
      },
    ],
  },
};

const route = useRoute();
const idParam = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : (route.params.id?.[0] ?? ''),
);

const user = computed<MockUser>(() => {
  const key = idParam.value.trim();
  const fallbackId = Number.isFinite(Number(key)) ? Number(key) : 0;
  const mock = MOCK_USERS[key];
  if (mock) {
    return mock;
  }
  return {
    id: fallbackId || 0,
    name: key ? `使用者 #${key}` : '未指定使用者',
    discordId: null,
    avatar: '',
    description: '此為示範用假資料；尚未為此 id 設定完整 Mock。',
    role: 0,
    createdAt: '—',
    updatedAt: '—',
    userGames: [],
  };
});

const initials = computed(() => {
  const n = user.value.name.trim();
  return n ? n.slice(0, 1).toUpperCase() : '?';
});

function statusLabel(status: number) {
  if (status === 1) return '已完食';
  if (status === 0) return '進行中／未標記';
  return `狀態 ${status}`;
}
</script>

<style scoped>
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.game-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  height: 100%;
}

.game-card:hover {
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14) !important;
  transform: translateY(-2px);
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 0.8125rem;
}

.game-meta-label {
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 600;
}

.game-meta-value {
  text-align: right;
  word-break: break-word;
}

.empty-state {
  border-style: dashed;
}
</style>
