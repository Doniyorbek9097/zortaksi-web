/**
 * DOM matnlarini Lotin ↔ Kirill ga o'giradi (client).
 * Vue qayta render qilganda ham MutationObserver orqali yangilanadi.
 */
import {
  cyrillicToLatin,
  latinToCyrillic,
  looksCyrillic,
  looksLatinUz,
} from '~/utils/uzScript'
import type { ScriptType } from '~/components/profile/ScriptToggle.vue'

const ORIG = '__ztScriptOrig'

type TextNodeEx = Text & { [ORIG]?: string }

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
  'SVG',
  'PATH',
])

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const

function shouldSkipEl(el: Element | null): boolean {
  if (!el) return true
  if (SKIP_TAGS.has(el.tagName)) return true
  if (el.closest('[data-no-script], [contenteditable="true"]')) return true
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true
  return false
}

function convertText(raw: string, mode: ScriptType): string {
  const s = String(raw || '')
  if (!s.trim()) return s
  // URL / email / telefon — o'zgartirmaymiz
  if (/https?:\/\//i.test(s) || /www\./i.test(s) || /@\w+\.\w+/.test(s)) return s
  if (/^\+?\d[\d\s\-()]{5,}$/.test(s.trim())) return s

  if (mode === 'cyrillic') {
    if (looksCyrillic(s) && !looksLatinUz(s)) return s
    return latinToCyrillic(s)
  }
  if (looksLatinUz(s) && !looksCyrillic(s)) return s
  return cyrillicToLatin(s)
}

function processTextNode(node: TextNodeEx, mode: ScriptType) {
  const parent = node.parentElement
  if (shouldSkipEl(parent)) return
  const cur = node.nodeValue ?? ''
  if (!cur.trim()) return

  if (!node[ORIG]) {
    // Birinchi ko'rinish — manba lotin deb olamiz (agar krill bo'lsa — lotinga qaytaramiz)
    node[ORIG] = looksCyrillic(cur) ? cyrillicToLatin(cur) : cur
  } else if (cur !== node[ORIG] && cur !== convertText(node[ORIG], 'cyrillic') && cur !== convertText(node[ORIG], 'latin')) {
    // Vue yangi matn yozdi
    node[ORIG] = looksCyrillic(cur) ? cyrillicToLatin(cur) : cur
  }

  const next = convertText(node[ORIG], mode)
  if (node.nodeValue !== next) node.nodeValue = next
}

function processAttrs(el: Element, mode: ScriptType) {
  if (shouldSkipEl(el)) return
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue
    const key = `__zt_${attr}`
    const anyEl = el as any
    const cur = el.getAttribute(attr) || ''
    if (!anyEl[key]) {
      anyEl[key] = looksCyrillic(cur) ? cyrillicToLatin(cur) : cur
    } else if (
      cur !== anyEl[key] &&
      cur !== convertText(anyEl[key], 'cyrillic') &&
      cur !== convertText(anyEl[key], 'latin')
    ) {
      anyEl[key] = looksCyrillic(cur) ? cyrillicToLatin(cur) : cur
    }
    const next = convertText(anyEl[key], mode)
    if (cur !== next) el.setAttribute(attr, next)
  }
}

export function applyScriptToDom(root: ParentNode, mode: ScriptType) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = (node as Text).parentElement
      if (shouldSkipEl(p)) return NodeFilter.FILTER_REJECT
      if (!(node.nodeValue || '').trim()) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes: TextNodeEx[] = []
  let n: Node | null
  while ((n = walker.nextNode())) nodes.push(n as TextNodeEx)
  for (const node of nodes) processTextNode(node, mode)

  if (root instanceof Element || root instanceof Document) {
    const scope = root instanceof Document ? root.body : root
    if (!scope) return
    const els = scope.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(','))
    els.forEach((el) => processAttrs(el, mode))
    if (scope instanceof Element) processAttrs(scope, mode)
  }
}

export function createScriptObserver(getMode: () => ScriptType) {
  let scheduled = false
  const run = () => {
    scheduled = false
    const root = document.getElementById('__nuxt') || document.body
    if (root) applyScriptToDom(root, getMode())
  }
  const schedule = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(run)
  }

  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData' || m.type === 'childList' || m.type === 'attributes') {
        schedule()
        break
      }
    }
  })

  const start = () => {
    const root = document.getElementById('__nuxt') || document.body
    if (!root) return
    obs.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    })
    run()
  }

  return { start, stop: () => obs.disconnect(), refresh: run }
}
