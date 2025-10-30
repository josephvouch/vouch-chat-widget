import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  const increment = (): void => {
    count.value += 1
  }

  const formatted = computed<string>(() => `Count is ${count.value}`)

  return {
    count,
    formatted,
    increment,
  }
})
