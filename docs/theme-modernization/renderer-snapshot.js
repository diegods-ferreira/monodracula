(() => {
 const style = e => { const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,fontStyle:s.fontStyle,fontWeight:s.fontWeight,opacity:s.opacity,border:s.borderColor,outline:s.outlineColor,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth}; };
 const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;
 const items=selector=>[...document.querySelectorAll(selector)].filter(visible).map(e=>({text:e.textContent,label:e.getAttribute('aria-label'),classes:e.className,style:style(e)}));
 const root=document.querySelector('.monaco-workbench')||document.body,css=getComputedStyle(root);
 const agentRules=[];const rules=rs=>{for(const r of rs){if(r.cssRules)rules(r.cssRules);if(r.style?.cssText.includes('var(--vscode-agentsPanel-border')){let elements=[];try{elements=[...document.querySelectorAll(r.selectorText)].filter(visible).map(e=>({tag:e.tagName,classes:e.className,style:style(e),width:getComputedStyle(e).borderTopWidth}));}catch{}agentRules.push({selector:r.selectorText,css:r.style.cssText,elements});}}};for(const sheet of document.styleSheets)try{rules(sheet.cssRules);}catch{}
 return {title:document.title,focused:document.hasFocus(),agentRules,activeElement:{text:document.activeElement?.textContent,classes:document.activeElement?.className},theme:{editorBackground:css.getPropertyValue('--vscode-editor-background'),editorForeground:css.getPropertyValue('--vscode-editor-foreground'),agentsPanelBorder:css.getPropertyValue('--vscode-agentsPanel-border')},
 lines:[...document.querySelectorAll('.view-lines .view-line')].filter(visible).map(e=>({text:e.textContent,spans:[...e.querySelectorAll('span')].filter(s=>!s.children.length).map(s=>({text:s.textContent,style:style(s)}))})),
 guides:items('.core-guide'),guideRendering:[...document.querySelectorAll('.core-guide')].filter(visible).map(e=>({classes:e.className,shadow:getComputedStyle(e).boxShadow,beforeShadow:getComputedStyle(e,'::before').boxShadow,afterShadow:getComputedStyle(e,'::after').boxShadow})),tabs:items('.tabs-container .tab'),tabLabels:items('.tabs-container .tab .label-name'),
 activity:items('.activitybar .action-item'),activityLabels:items('.activitybar .action-label'),
 explorer:items('.explorer-folders-view .monaco-list-row'),explorerLabels:items('.explorer-folders-view .monaco-list-row .label-name'),buttons:items('.monaco-button'),
 inspectors:items('.token-inspect-widget'),dialogs:items('.monaco-dialog-box')};
})()
