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

        <div class="mb-2 text-subtitle-2">遊戲紀錄（UserGame）</div>
        <div v-if="user.userGames.length === 0" class="text-body-2 text-medium-emphasis">
          尚無關聯遊戲資料。
        </div>
        <v-table v-else density="comfortable" class="rounded border bg-surface">
          <thead>
            <tr>
              <th class="text-start">gameErogsId</th>
              <th class="text-start">status</th>
              <th class="text-center">願望清單</th>
              <th class="text-center">黑名單</th>
              <th class="text-start">開始</th>
              <th class="text-start">完食</th>
              <th class="text-start">建立</th>
              <th class="text-start">更新</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ug, idx) in user.userGames" :key="`${ug.gameErogsId}-${idx}`">
              <td>{{ ug.gameErogsId }}</td>
              <td>{{ ug.status }}</td>
              <td class="text-center">{{ ug.wishListMark ? '是' : '否' }}</td>
              <td class="text-center">{{ ug.blackListMark ? '是' : '否' }}</td>
              <td class="text-caption">{{ ug.startDate ?? '—' }}</td>
              <td class="text-caption">{{ ug.finishedDate ?? '—' }}</td>
              <td class="text-caption text-medium-emphasis">{{ ug.createdAt }}</td>
              <td class="text-caption text-medium-emphasis">{{ ug.updatedAt }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
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
  if (MOCK_USERS[key]) {
    return MOCK_USERS[key];
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
</script>
