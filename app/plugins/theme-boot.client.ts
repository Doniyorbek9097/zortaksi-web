import { syncSystemPrefersDarkState, useTheme } from '~/composables/useTheme'

/** Qurilma rejimi + `dark` klassi — Vue / hydratsiya oldin */
export default defineNuxtPlugin({
  name: 'theme-boot',
  enforce: 'pre',
  parallel: false,
  setup() {
    syncSystemPrefersDarkState()
    useTheme().initTheme()
  },
})