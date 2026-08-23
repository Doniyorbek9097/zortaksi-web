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
import { hidePhoneNumbers } from '~/utils/phone'

const props = withDefaults(
  defineProps<{
    text?: string
    /** out bubble — oq link; in — sky */
    out?: boolean
    /** Telefon raqamlarini tel: link qilmasdan maskalaydi */
    maskPhones?: boolean
  }>(),
  { text: '', out: false, maskPhones: false }
)

const displayText = computed(() =>
  props.maskPhones ? hidePhoneNumbers(props.text || '') : props.text || ''
)

const parts = computed(() => linkifyParts(displayText.value))

const linkClass = computed(() =>
  'text-sky-600 hover:text-sky-500'
)
</script>
