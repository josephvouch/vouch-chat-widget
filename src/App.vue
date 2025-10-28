<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-center"
  >
    <div class="flex items-center gap-8">
      <a
        href="https://vite.dev"
        target="_blank"
        class="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/60 shadow-lg ring-1 ring-slate-700 transition hover:-translate-y-1 hover:ring-indigo-400"
      >
        <img src="/vite.svg" class="h-12 w-12" alt="Vite logo" />
      </a>
      <a
        href="https://vuejs.org/"
        target="_blank"
        class="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/60 shadow-lg ring-1 ring-slate-700 transition hover:-translate-y-1 hover:ring-emerald-400"
      >
        <img src="./assets/vue.svg" class="h-12 w-12" alt="Vue logo" />
      </a>
    </div>
    <RouterView />
  </main>
</template>
