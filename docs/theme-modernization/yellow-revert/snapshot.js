(() => {
 const visible=e=>e.checkVisibility({checkVisibilityCSS:true,checkOpacity:true})&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
 const style=(e,pseudo)=>{const s=getComputedStyle(e,pseudo);return {color:s.color,background:s.backgroundColor,border:s.borderColor,borderWidth:s.borderWidth,outline:s.outlineColor,fontStyle:s.fontStyle,fontWeight:s.fontWeight,opacity:s.opacity};};
 const ancestry=e=>{const a=[];for(let p=e.parentElement;p;p=p.parentElement)a.push({classes:p.className,style:style(p)});return a;};
 const items=selector=>[...document.querySelectorAll(selector)].filter(visible).map(e=>({text:e.textContent,classes:e.className,style:style(e),ancestry:ancestry(e)}));
 const root=document.querySelector('.monaco-workbench'),css=getComputedStyle(root);
 const chat={};for(const name of ['chat-find-current-match','chat-find-other-match']){const h=CSS.highlights.get(name);chat[name]=h?[...h].map(range=>{const el=range.startContainer.parentElement;return {text:range.toString(),style:style(el,'::highlight('+name+')'),ancestry:ancestry(el)};}):[];}
 return {focused:document.hasFocus(),activeElement:{tag:document.activeElement.tagName,classes:document.activeElement.className},
 variables:Object.fromEntries(['editor.background','editor.foreground','editor.findMatchForeground','editor.findMatchHighlightForeground','editor.findMatchBackground','editor.findMatchHighlightBackground','editor.findMatchBorder','editor.findMatchHighlightBorder','list.highlightForeground','quickInputList.focusHighlightForeground','quickInputList.focusForeground','quickInputList.focusBackground','chat.findMatchBackground','chat.findMatchHighlightBackground'].map(k=>[k,css.getPropertyValue('--vscode-'+k.replaceAll('.','-'))])),
 quickRows:[...document.querySelectorAll('.quick-input-list .monaco-list-row')].filter(visible).map(e=>({classes:e.className,style:style(e),labels:[...e.querySelectorAll('.label-name')].map(l=>({text:l.textContent,style:style(l),parts:[...l.querySelectorAll('span')].filter(s=>!s.children.length).map(s=>({text:s.textContent,classes:s.className,style:style(s)}))}))})),
 lines:[...document.querySelectorAll('.view-lines .view-line')].filter(visible).map(e=>({text:e.textContent,parts:[...e.querySelectorAll('span')].filter(s=>!s.children.length).map(s=>({text:s.textContent,classes:s.className,style:style(s)}))})),
 matches:items('.monaco-editor .findMatchInline,.monaco-editor .currentFindMatchInline'),boxes:items('.monaco-editor .findMatch,.monaco-editor .currentFindMatch'),search:items('.search-view .findInFileMatch'),shortcuts:items('.keybindings-editor .highlight'),chat,
 chatText:[...document.querySelectorAll('.interactive-request,.interactive-response')].filter(visible).map(e=>e.textContent.slice(0,180))};
})()
