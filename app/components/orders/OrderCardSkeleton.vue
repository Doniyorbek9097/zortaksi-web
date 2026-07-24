<template>
  <div class="relative pt-3" aria-hidden="true">
    <!-- Group title chip -->
    <div class="absolute left-1/2 top-3 z-20 -translate-x-1/2 -translate-y-1/2 px-2 pointer-events-none">
      <div
        class="h-7 w-28 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 animate-pulse"
      />
    </div>

    <article
      class="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-200 dark:border-l-slate-700 pt-5 px-4 pb-4"
    >
      <!-- Sender -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-3.5 w-32 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div class="h-3 w-16 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      <div class="my-3 border-t border-slate-100 dark:border-slate-800" />

      <!-- Message lines -->
      <div class="space-y-2">
        <div class="h-3.5 w-full rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div class="h-3.5 w-[88%] rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div class="h-3.5 w-[62%] rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>

      <!-- Actions -->
      <div class="mt-4 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div class="min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div class="min-h-[46px] w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </article>
  </div>
</template>
