<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
const { formatted } = storeToRefs(counter)
</script>

<template>
  <section
    class="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur"
  >
    <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
      Vite + Vue + Tailwind
    </h1>

    <div class="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        class="w-full rounded-full bg-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-400 focus-visible:ring-indigo-300"
        @click="counter.increment"
      >
        {{ formatted }}
      </button>
      <p class="text-sm text-slate-300">
        Edit
        <code
          class="rounded bg-slate-800/80 px-2 py-1 text-xs font-mono text-indigo-300"
        >
          components/HelloWorld.vue
        </code>
        and see Tailwind-powered HMR in action.
      </p>
    </div>

    <div class="space-y-2 text-sm text-slate-400">
      <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
          >create-vue</a
        >
        for the official Vue + Vite starter.
      </p>
      <p>
        Learn more about IDE tooling in the
        <a
          href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
          target="_blank"
          >Vue docs scaling-up guide</a
        >.
      </p>
    </div>
  </section>
</template>
