/**
 * Hydrationdan oldin Android status bar rangi (light = oq, dark = qorong'u).
 */
;(function () {
  try {
    var match = document.cookie.match(/(?:^|;\s*)zt-theme=([^;]+)/)
    var pref = match ? decodeURIComponent(match[1]) : 'system'
    var dark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    var status = dark ? '#020617' : '#ffffff'
    var pageBg = dark ? '#020617' : '#f8fafc'
    var meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', status)
    var scheme = document.querySelector('meta[name="color-scheme"]')
    if (!scheme) {
      scheme = document.createElement('meta')
      scheme.setAttribute('name', 'color-scheme')
      document.head.appendChild(scheme)
    }
    scheme.setAttribute('content', dark ? 'dark' : 'light')
    document.documentElement.style.backgroundColor = pageBg
    document.documentElement.style.colorScheme = dark ? 'only dark' : 'only light'
  } catch (e) {
    /* */
  }
})()