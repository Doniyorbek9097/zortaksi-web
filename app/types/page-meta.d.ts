export {}

declare module '#app' {
  interface PageMeta {
    /** false — PTR o‘chiriladi (masalan, reals videolar) */
    pullToRefresh?: false | { scrollSelector?: string }
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    pullToRefresh?: false | { scrollSelector?: string }
  }
}
