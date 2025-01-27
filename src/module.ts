import { addImportsDir, defineNuxtModule } from '@nuxt/kit'

import { resolve } from 'pathe' // Use 'pathe' for cross-platform path resolution

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
    addImportsDir(
      resolve(nuxt.options.buildDir, 'modules/cubic-forms/composables'),
    )
  },
})
