import { Ref } from 'vue'

// global-nuxt.d.ts
declare global {
  // Provide the minimal signature you need
  function useState<T>(key: string, init?: () => T): Ref<T>
}

export {}
