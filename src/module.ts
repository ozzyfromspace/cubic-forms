import { addImportsDir, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'cubic-forms',
    configKey: 'cubicForms',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  setup(options, nuxt) {
    // Add the composables directory to Nuxt's auto-imports
    addImportsDir('./composables')
  },
})
