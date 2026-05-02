<template>
  <div>
    <NavBar />

    <div style="height: 64px" />

    <v-main>
      <slot />
      <NuxtRouteAnnouncer />
    </v-main>
  </div>
</template>
