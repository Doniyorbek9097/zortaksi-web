<template>
  <section
    class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
  >
    <h2 class="text-sm font-black text-slate-900 dark:text-white">Ma'lumot</h2>

    <div class="grid grid-cols-2 gap-2">
      <div
        class="col-span-2 rounded-xl p-3 min-h-[76px] flex flex-col bg-teal-50 dark:bg-teal-950/35 border border-teal-100 dark:border-teal-900/50"
      >
        <div
          class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 bg-teal-500 text-white shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-users" />
        </div>
        <p class="mt-2 text-[10px] font-bold uppercase tracking-wide text-teal-600/80 dark:text-teal-400/80">
          Biriktirilgan guruh
        </p>
        <p class="mt-0.5 text-[14px] font-black leading-snug text-teal-800 dark:text-teal-200 truncate">
          {{ assignedGroupTitle || regionTitle || '—' }}
        </p>
        <p
          v-if="regionSlug"
          class="text-[10px] font-mono text-teal-600/70 dark:text-teal-400/60 mt-0.5 truncate"
        >
          {{ regionTitle || regionSlug }}
        </p>
      </div>

      <div
        class="col-span-2 rounded-xl p-3 min-h-[68px] flex flex-col bg-amber-50 dark:bg-amber-950/35 border border-amber-100 dark:border-amber-900/50"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 bg-amber-500 text-white shadow-sm"
          >
            <font-awesome-icon icon="fa-solid fa-calendar-check" />
          </div>
          <p class="text-[10px] font-bold uppercase tracking-wide text-amber-600/80 dark:text-amber-400/80">
            Ro'yxatdan o'tgan
          </p>
        </div>
        <p class="mt-2 text-[14px] font-black leading-snug text-amber-800 dark:text-amber-200">
          {{ registeredLabel }}
        </p>
      </div>

      <div
        class="rounded-xl p-3 min-h-[76px] flex flex-col bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900/50"
      >
        <div
          class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 bg-emerald-500 text-white shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-user-plus" />
        </div>
        <p class="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80">
          Guruhga qo'shgan
        </p>
        <p class="mt-0.5 text-[18px] font-black leading-none tabular-nums text-emerald-700 dark:text-emerald-300">
          {{ groupInviteCount ?? 0 }}
          <span class="text-[11px] font-bold">ta</span>
        </p>
      </div>

      <div
        class="rounded-xl p-3 min-h-[76px] flex flex-col bg-violet-50 dark:bg-violet-950/35 border border-violet-100 dark:border-violet-900/50"
      >
        <div
          class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 bg-violet-500 text-white shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-mobile-screen" />
        </div>
        <p class="mt-2 text-[10px] font-bold uppercase tracking-wide text-violet-600/80 dark:text-violet-400/80">
          Ilovaga taklif
        </p>
        <p class="mt-0.5 text-[18px] font-black leading-none tabular-nums text-violet-700 dark:text-violet-300">
          {{ appInviteCount ?? 0 }}
          <span class="text-[11px] font-bold">ta</span>
        </p>
      </div>
    </div>

    <div v-if="inviteGroups?.length" class="space-y-2">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Guruhlar bo'yicha</p>
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="g in inviteGroups"
          :key="g.id || g.title"
          class="rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
        >
          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate min-w-0">
            {{ g.title }}
          </span>
          <span class="shrink-0 text-[13px] font-black text-sky-500 tabular-nums">{{ g.count }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface InviteGroup {
  id?: string
  title: string
  count: number
}

interface Props {
  assignedGroupTitle?: string | null
  regionTitle?: string | null
  regionSlug?: string | null
  registeredAt?: string | null
  createdAt?: string | Date | null
  groupInviteCount?: number
  appInviteCount?: number
  inviteGroups?: InviteGroup[]
}

const props = defineProps<Props>()

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('uz-UZ')
}

const registeredLabel = computed(() => {
  const direct = String(props.registeredAt || '').trim()
  if (direct) return direct
  const fromCreated = formatDate(props.createdAt)
  return fromCreated === '—' ? '—' : fromCreated
})
</script>
