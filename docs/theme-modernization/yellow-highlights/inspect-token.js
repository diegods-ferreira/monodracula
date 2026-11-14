(() => [...document.querySelectorAll('.token-inspect-widget')].filter(e=>e.checkVisibility()).map(e=>({text:e.innerText,html:e.outerHTML})))()
