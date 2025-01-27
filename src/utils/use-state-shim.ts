import _ from 'lodash'
import { createPinia, defineStore } from 'pinia'
import { ref, Ref } from 'vue'

// type definition of useState for this file only
declare const useState: typeof import('nuxt/app')['useState']

// defined globally
let resolvedUseState: typeof import('nuxt/app')['useState'] | undefined =
  undefined
let piniaFallbackStore: ReturnType<typeof createFallbackStore> | undefined =
  undefined

// Function to resolve useState from Nuxt or fallback to Pinia
function resolveUseState() {
  if (!resolvedUseState) {
    // Check if `useState` is available in the Nuxt runtime
    if (typeof useState !== 'undefined') {
      resolvedUseState = useState
    } else {
      // If useState is not available, attempt to use Pinia
      try {
        if (!piniaFallbackStore) {
          const pinia = createPinia()
          piniaFallbackStore = createFallbackStore(pinia)
        }
      } catch (err) {
        throw new Error(
          'Neither `useState` nor Pinia is available. Ensure you are using this library in a Nuxt application or install Pinia for fallback state management.',
        )
      }
    }
  }
  return resolvedUseState
}

// Define a Pinia store for fallback state management
function createFallbackStore(pinia: ReturnType<typeof createPinia>) {
  return defineStore('useState/fallbackState', () => {
    const state = new Map<string, Ref<any>>()

    function get<T>(key: string, init?: () => T | Ref<T>): Ref<T> {
      if (!state.has(key)) {
        state.set(key, ref(init ? init?.() : undefined))
      }
      return state.get(key) as Ref<T>
    }

    return { get }
  })(pinia)
}

// Export a safe wrapper with Pinia fallback
export function useStateShim<T>(key?: string, init?: () => T | Ref<T>): Ref<T>
export function useStateShim<T>(init?: () => T | Ref<T>): Ref<T>
export function useStateShim<T>(
  keyOrInit?: string | (() => T | Ref<T>),
  init?: () => T | Ref<T>,
) {
  const resolved = resolveUseState()

  if (resolved) {
    if (typeof keyOrInit === 'string' || keyOrInit === undefined) {
      // Ensure `init` is a function or undefined
      if (!_.isFunction(init) && init) {
        throw new Error(
          `useStateShim received key of type '${typeof keyOrInit}', init of type 'undefined | function' was expected (init of type '${typeof init})' received.`,
        )
      }
      return resolved(keyOrInit as string | undefined, init)
    }

    // Key is not a function or undefined
    if (!_.isFunction(keyOrInit) && keyOrInit) {
      throw new Error(
        `useStateShim 'key' must be of type 'string | undefined | (() => T | Ref<T>)', but value of type '${typeof keyOrInit}' was supplied.`,
      )
    }

    return resolved(keyOrInit)
  }

  // Use Pinia fallback if `useState` is not available
  if (piniaFallbackStore) {
    const key =
      typeof keyOrInit === 'string' ? keyOrInit : `pinia-fallback-${Date.now()}`
    return piniaFallbackStore.get(
      key,
      keyOrInit as (() => T | Ref<T>) | undefined,
    )
  }

  throw new Error(
    'Unexpected error: neither `useState` nor Pinia fallback could be resolved.',
  )
}
