import { applyRootThemeBootstrap } from '~/utils/themeBoot'

/** `dark` klassi va fon — Vue / SessionGate yuklanishidan oldin */
export default defineNuxtPlugin({
  name: 'theme-boot',
  enforce: 'pre',
  parallel: true,
  setup() {
    applyRootThemeBootstrap()
  },
})