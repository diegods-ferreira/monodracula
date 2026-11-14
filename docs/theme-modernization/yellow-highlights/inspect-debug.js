(() => ({text:document.body.innerText.slice(-14000),widgets:[...document.querySelectorAll('[class*="inspect"]')].map(e=>({classes:e.className,text:e.innerText}))}))()
