<template>
  <div>
    <NavBar />

    <div class="layout-nav-spacer" />

    <v-main>
      <slot />
      <NuxtRouteAnnouncer />
    </v-main>
  </div>
</template>

<style scoped>
.layout-nav-spacer {
  height: 56px;
}
</style>
