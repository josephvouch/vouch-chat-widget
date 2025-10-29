<script setup lang="ts">
import ChatbotShell from '../components/chatbot/ChatbotShell.vue'
</script>

<template>
  <section
    class="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-6 py-10 text-center text-slate-100"
  >
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold">Chatbot Widget Preview</h1>
      <p class="max-w-xl text-sm text-slate-400">
        Use the activator in the bottom corner to open the chatbot. This route mirrors
        the embeddable widget experience.
      </p>
    </header>
    <div class="flex items-center gap-6">
      <span class="h-3 w-3 animate-ping rounded-full bg-sky-500/40" />
      <span class="text-xs uppercase tracking-[0.35em] text-slate-500">
        Ready to chat
      </span>
    </div>
  </section>
  <ChatbotShell />
</template>
