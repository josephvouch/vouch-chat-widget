<script setup lang="ts">
import ChatbotWrapper from '@modules/button-activator/view/ChatbotWrapper.vue'
</script>

<template>
  <section
    class="vc3-flex vc3-min-h-screen vc3-flex-col vc3-items-center vc3-justify-center vc3-gap-6 vc3-bg-slate-50 vc3-px-6 vc3-py-10 vc3-text-center vc3-text-slate-900"
  >
    <header class="vc3-space-y-2">
      <h1 class="vc3-text-3xl vc3-font-semibold">Chatbot Widget Preview</h1>
      <p class="vc3-max-w-xl vc3-text-sm vc3-text-slate-600">
        Use the activator in the bottom corner to open the chatbot. This route mirrors the embeddable widget experience.
      </p>
    </header>
    <div class="vc3-flex vc3-items-center vc3-gap-6">
      <span class="vc3-h-3 vc3-w-3 vc3-animate-ping vc3-rounded-full vc3-bg-sky-500/40" />
      <span class="vc3-text-xs vc3-uppercase vc3-tracking-[0.35em] vc3-text-slate-500"> Ready to chat </span>
    </div>
  </section>
  <ChatbotWrapper />
</template>
