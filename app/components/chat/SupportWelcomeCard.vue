<template>
  <div class="shrink-0 mx-auto w-full max-w-2xl px-3 py-2">
    <div :class="supportWelcomeCardClass">
      <div :class="supportWelcomeOverlayClass" aria-hidden="true" />

      <div class="relative px-3.5 py-3 flex items-start gap-3">
        <span :class="supportHeaderIconClass">
          <font-awesome-icon icon="fa-solid fa-headset" class="text-[15px]" />
        </span>
        <p :class="supportWelcomeSubtitleClass">
          {{ SUPPORT_WELCOME_TEXT }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SUPPORT_WELCOME_TEXT,
  supportHeaderIconClass,
  supportWelcomeCardClass,
  supportWelcomeOverlayClass,
  supportWelcomeSubtitleClass,
} from '~/utils/supportChatTheme'
</script>
