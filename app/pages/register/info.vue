<template>
  <v-container class="py-6 py-md-8" max-width="sm">
    <v-card rounded="xl" variant="outlined">
      <v-card-text class="pa-6">
        <h2 class="text-h5 font-weight-bold mb-4">申辦結果</h2>

        <div v-if="!ready" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate size="32" width="3" />
        </div>

        <template v-else>
          <v-alert v-if="result" :type="result.variant" variant="tonal" class="mb-4">
            {{ result.message }}
          </v-alert>
          <v-alert v-else type="info" variant="tonal" class="mb-4">
            查無這次申辦的紀錄。若您是直接進入此頁，請從邀請連結回到申辦表單再送出。
          </v-alert>
          <v-btn color="primary" block size="large" to="/">回到首頁</v-btn>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { consumeRegisterSubmitInfo, type RegisterSubmitInfo } from '~/utils/register';

const ready = ref(false);
const result = ref<RegisterSubmitInfo | null>(null);

onMounted(() => {
  result.value = consumeRegisterSubmitInfo();
  ready.value = true;
});
</script>
