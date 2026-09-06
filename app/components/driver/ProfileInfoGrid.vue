<template>
  <section
    class="rounded-2xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
  >
    <h2 class="text-[12px] font-black text-slate-900 dark:text-white">Ma'lumot</h2>

    <div class="grid grid-cols-2 gap-1.5">
      <div
        class="col-span-2 flex items-center gap-2 rounded-lg px-2.5 py-2 bg-teal-50 dark:bg-teal-950/35 border border-teal-100 dark:border-teal-900/50"
      >
        <div
          class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 bg-teal-500 text-white"
        >
          <font-awesome-icon icon="fa-solid fa-users" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-bold uppercase tracking-wide text-teal-600/80 dark:text-teal-400/80 leading-none">
            Biriktirilgan guruh
          </p>
          <p class="mt-0.5 text-[12px] font-black text-teal-800 dark:text-teal-200 truncate leading-tight">
            {{ assignedGroupTitle || regionTitle || '—' }}
          </p>
          <p
            v-if="regionSlug"
            class="text-[9px] font-mono text-teal-600/65 dark:text-teal-400/55 truncate leading-tight"
          >
            {{ regionTitle || regionSlug }}
          </p>
        </div>
      </div>

      <div
        class="col-span-2 flex items-center gap-2 rounded-lg px-2.5 py-2 bg-amber-50 dark:bg-amber-950/35 border border-amber-100 dark:border-amber-900/50"
      >
        <div
          class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 bg-amber-500 text-white"
        >
          <font-awesome-icon icon="fa-solid fa-calendar-check" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-bold uppercase tracking-wide text-amber-600/80 dark:text-amber-400/80 leading-none">
            Ro'yxatdan o'tgan
          </p>
          <p class="mt-0.5 text-[12px] font-black text-amber-800 dark:text-amber-200 leading-tight">
            {{ registeredLabel }}
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900/50"
      >
        <div
          class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 bg-emerald-500 text-white"
        >
          <font-awesome-icon icon="fa-solid fa-user-plus" />
        </div>
        <div class="min-w-0">
          <p class="text-[9px] font-bold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80 leading-none">
            Guruhga qo'shgan
          </p>
          <p class="mt-0.5 text-[15px] font-black leading-none tabular-nums text-emerald-700 dark:text-emerald-300">
            {{ groupInviteCount ?? 0 }}
            <span class="text-[10px] font-bold">ta</span>
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-violet-50 dark:bg-violet-950/35 border border-violet-100 dark:border-violet-900/50"
      >
        <div
          class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 bg-violet-500 text-white"
        >
          <font-awesome-icon icon="fa-solid fa-mobile-screen" />
        </div>
        <div class="min-w-0">
          <p class="text-[9px] font-bold uppercase tracking-wide text-violet-600/80 dark:text-violet-400/80 leading-none">
            Ilovaga taklif
          </p>
          <p class="mt-0.5 text-[15px] font-black leading-none tabular-nums text-violet-700 dark:text-violet-300">
            {{ appInviteCount ?? 0 }}
            <span class="text-[10px] font-bold">ta</span>
          </p>
        </div>
      </div>
    </div>

    <div v-if="inviteGroups?.length" class="space-y-1.5">
      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Guruhlar bo'yicha</p>
      <div class="grid grid-cols-2 gap-1.5">
        <div
          v-for="g in inviteGroups"
          :key="g.id || g.title"
          class="rounded-lg px-2 py-1.5 flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
        >
          <span class="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate min-w-0">
            {{ g.title }}
          </span>
          <span class="shrink-0 text-[11px] font-black text-sky-500 tabular-nums">{{ g.count }}</span>
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
