import { syncSystemPrefersDarkState, useTheme } from '~/composables/useTheme'
import { readDevicePrefersDark } from '~/utils/themeChrome'
import { applyRootThemeBootstrap } from '~/utils/themeBoot'

/** Qurilma rejimi + `dark` klassi — Vue / hydratsiya oldin */
export default defineNuxtPlugin({
  name: 'theme-boot',
  enforce: 'pre',
  parallel: false,
  setup() {
    syncSystemPrefersDarkState()
    const dark = readDevicePrefersDark()
    useState('zt-system-prefers-dark', () => dark).value = dark
    applyRootThemeBootstrap()
    useTheme().initTheme()
  },
})