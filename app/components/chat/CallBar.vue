<template>
  <a
    :href="href"
    class="chat-call-bar"
    :class="{ 'chat-call-bar--compact': compact }"
  >
    <span class="chat-call-bar__icon" aria-hidden="true">
      <font-awesome-icon icon="fa-solid fa-phone-volume" class="text-[15px]" />
    </span>
    <span class="chat-call-bar__label">{{ label }}</span>
    <span class="chat-call-bar__action" aria-hidden="true">
      <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-[12px]" />
    </span>
  </a>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    href: string
    label?: string
    compact?: boolean
  }>(),
  {
    label: "Qo'ng'iroq qiling",
    compact: false,
  },
)
</script>

<style scoped>
.chat-call-bar {
  display: flex;
  width: 100%;
  height: 60px;
  margin-bottom: 5px;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border: 0;
  border-radius: 0;
  text-decoration: none;
  color: #047857;
  background: linear-gradient(90deg, #ecfdf5 0%, #d1fae5 45%, #ecfdf5 100%);
  background-size: 200% 100%;
  animation: chat-call-bar-shimmer 3.5s ease-in-out infinite;
  box-shadow: inset 0 -1px 0 rgba(16, 185, 129, 0.12);
}

.chat-call-bar--compact {
  border-radius: 0.75rem;
  margin-bottom: 0;
}

.dark .chat-call-bar {
  color: #6ee7b7;
  background: linear-gradient(
    90deg,
    rgba(6, 78, 59, 0.55) 0%,
    rgba(4, 120, 87, 0.4) 45%,
    rgba(6, 78, 59, 0.55) 100%
  );
  background-size: 200% 100%;
  box-shadow: inset 0 -1px 0 rgba(52, 211, 153, 0.15);
}

.chat-call-bar:active {
  filter: brightness(0.96);
}

.chat-call-bar__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(145deg, #34d399, #059669);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  animation: chat-call-bar-pulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

.chat-call-bar__label {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.chat-call-bar__action {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  background: rgba(255, 255, 255, 0.75);
  flex-shrink: 0;
  animation: chat-call-bar-nudge 2.2s ease-in-out infinite;
}

.dark .chat-call-bar__action {
  color: #6ee7b7;
  background: rgba(15, 23, 42, 0.45);
}

@keyframes chat-call-bar-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes chat-call-bar-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
  }
}

@keyframes chat-call-bar-nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}
</style>
