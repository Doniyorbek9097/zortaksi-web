<template>
  <BaseConfirmDialog
    :model-value="modelValue"
    :title="title"
    :confirm-text="confirmText"
    cancel-text="Bekor"
    :variant="variant"
    :loading="loading"
    :close-on-confirm="false"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <PostGroupPreview :group="group" class="mt-4" />
    <p
      v-if="message"
      class="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line"
    >
      {{ message }}
    </p>
  </BaseConfirmDialog>
</template>

<script setup lang="ts">
import type { PostGroup } from '~/stores/post.store'

defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmText: string
  variant?: 'success' | 'warning' | 'danger' | 'primary'
  loading?: boolean
  group: PostGroup | null
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: []
  cancel: []
}>()
</script>
