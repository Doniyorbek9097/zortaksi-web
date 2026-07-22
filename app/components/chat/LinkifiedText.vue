<template>
  <span class="whitespace-pre-line break-words">
    <template v-for="(p, i) in parts" :key="i">
      <a
        v-if="p.type === 'link'"
        :href="p.href"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-2 font-bold break-all"
        :class="linkClass"
        @click.stop
      >{{ p.value }}</a>
      <a
        v-else-if="p.type === 'phone'"
        :href="p.href"
        class="underline underline-offset-2 font-bold"
        :class="linkClass"
        @click.stop
      >{{ p.value }}</a>
      <span v-else>{{ p.value }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { linkifyParts } from '~/utils/linkify'

const props = withDefaults(
  defineProps<{
    text?: string
    /** out bubble — oq link; in — sky */
    out?: boolean
  }>(),
  { text: '', out: false }
)

const parts = computed(() => linkifyParts(props.text || ''))

const linkClass = computed(() =>
  props.out
    ? 'text-white hover:text-sky-100'
    : 'text-sky-600 dark:text-sky-400 hover:text-sky-500'
)
</script>
