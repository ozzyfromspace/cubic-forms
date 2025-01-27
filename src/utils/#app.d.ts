declare module '#app' {
  import { useState as nuxtUseState } from 'nuxt/app'
  export { nuxtUseState as useState }
  // Export other Nuxt composables if needed
}
