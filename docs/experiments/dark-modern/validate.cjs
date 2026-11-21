const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { darkModern, syntaxColors, workbenchDefaults, monoMinDarkModernTabs } = require('./generate.cjs');
const extension = require('./extension/package.json');

execFileSync(process.execPath, [require.resolve('./generate.cjs'), '--check']);
execFileSync(process.execPath, [require.resolve('./generate.cjs'), '--check', '--official']);
assert.equal(darkModern.tokenColors.length, 65);
assert.equal(darkModern.semanticHighlighting, true);
assert.equal(darkModern.semanticRules.length, 8);

const keys = object => Object.keys(object).sort();
const difference = (left, right) => keys(left).filter(key => !Object.hasOwn(right, key));
const rgba = hex => {
  let value = hex.slice(1);
  if (value.length < 5) value = [...value].map(digit => digit.repeat(2)).join('');
  const [r, g, b, a = 255] = value.match(/../g).map(pair => parseInt(pair, 16));
  return [r, g, b, a / 255];
};
const composite = (color, base) => {
  const [r, g, b, alpha] = rgba(color);
  return [r, g, b].map((channel, index) => channel * alpha + base[index] * (1 - alpha));
};
const luminance = rgb => rgb.reduce((sum, byte, index) => {
  const srgb = byte / 255;
  const linear = srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  return sum + linear * [0.2126, 0.7152, 0.0722][index];
}, 0);
function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const pairs = [
  ['Contorno da busca no terminal', 'terminal.findMatchBorder', 'terminal.background', 'terminal.background', 3],
  ['Marcador da busca na régua do terminal', 'terminalOverviewRuler.findMatchForeground', 'terminal.background', 'terminal.background', 3],
  ['Texto do terminal', 'terminal.foreground', 'terminal.background', 'terminal.background', 4.5],
  ['ANSI bright black no terminal', 'terminal.ansiBrightBlack', 'terminal.background', 'terminal.background', 4.5],
  ['Texto no badge de atividade', 'activityBarBadge.foreground', 'activityBarBadge.background', 'activityBar.background', 4.5],
  ['Texto do botão', 'button.foreground', 'button.background', 'editor.background', 4.5],
  ['Texto do botão em hover', 'button.foreground', 'button.hoverBackground', 'editor.background', 4.5],
  ['Botão e editor', 'button.background', 'editor.background', 'editor.background', 3],
  ['Foco do agente e input', 'agentsChatInput.focusBorder', 'input.background', 'editor.background', 3],
  ['Texto do menu selecionado', 'menu.foreground', 'menu.selectionBackground', 'menu.background', 4.5],
  ['Opção de input selecionada', 'input.foreground', 'inputOption.activeBackground', 'input.background', 4.5],
  ['Borda do input', 'input.border', 'input.background', 'editor.background', 3],
  ['Aba ativa', 'tab.activeForeground', 'tab.activeBackground', 'editor.background', 4.5],
  ['Aba inativa', 'tab.inactiveForeground', 'tab.inactiveBackground', 'editor.background', 4.5],
  ['Indicador da aba ativa', 'tab.activeBorderTop', 'tab.activeBackground', 'editor.background', 3],
  ['Comando de chat', 'chat.slashCommandForeground', 'chat.slashCommandBackground', 'editor.background', 4.5],
  ['Texto no resultado atual', 'editor.foreground', 'editor.findMatchBackground', 'editor.background', 4.5],
  ['Contorno do resultado atual', 'editor.findMatchBorder', 'editor.background', 'editor.background', 3],
];

console.log('Dark Modern', keys(darkModern.colors).length, 'cores de interface');
for (const contribution of extension.contributes.themes) {
  const name = contribution.label.replace(' Experimental', '');
  const mono = require('./originals/' + name + 'Theme.json');
  const theme = require('./extension/' + contribution.path);
  assert.equal(theme.name, contribution.label);
  assert(!Object.hasOwn(theme, 'include'));
  assert.equal(theme.tokenColors.length, 161);
  assert.deepEqual(theme.tokenColors, mono.tokenColors);
  assert.equal(theme.tokenColors[0].settings.fontStyle, 'italic');
  for (const key of ['semanticHighlighting', 'semanticTokenColors']) {
    assert.equal(Object.hasOwn(theme, key), Object.hasOwn(mono, key));
    assert.deepEqual(theme[key], mono[key]);
  }
  const colors = theme.colors;
  assert.deepEqual(difference(darkModern.colors, colors), ['terminal.inactiveSelectionBackground']);
  const ansi = Object.keys(mono.colors).filter(key => key.startsWith('terminal.ansi'));
  assert.equal(ansi.length, 16);
  const terminal = [...ansi, 'terminal.background', 'terminal.selectionBackground'];
  for (const key of terminal) {
    const expected = name === 'MonoDracula' && key === 'terminal.ansiBrightBlack'
      ? '#939293' : mono.colors[key].toUpperCase();
    assert.equal(colors[key], expected, key);
  }
  const searchMarkers = ['terminal.findMatchBorder', 'terminalOverviewRuler.findMatchForeground'];
  for (const key of searchMarkers) {
    assert.equal(colors[key], name === 'MonoMin' ? '#F8C66B' : '#BD93F9', key);
  }
  for (const key of ['terminalCursor.background', 'terminalCursor.foreground']) {
    assert(!Object.hasOwn(colors, key), key);
  }
  assert.deepEqual(difference(colors, darkModern.colors),
    [...syntaxColors, ...keys(workbenchDefaults), ...terminal, ...searchMarkers, 'editor.findMatchBorder'].sort());
  const originalHues = new Set([...Object.values(mono.colors), ...mono.tokenColors.map(rule => rule.settings.foreground)]
    .filter(Boolean).map(value => value.toLowerCase().slice(0, 7)));
  for (const [key, value] of Object.entries(colors)) {
    assert.match(value, /^#[\da-f]{6}([\da-f]{2})?$/i, key);
    if (name === 'MonoMin' && monoMinDarkModernTabs.has(key)) {
      assert.equal(value, darkModern.colors[key], key);
    } else {
      assert(originalHues.has(value.toLowerCase().slice(0, 7)), key + ' ' + value);
    }
  }
  for (const key of syntaxColors) assert.equal(colors[key], mono.colors[key]);
  const common = keys(colors).filter(key => Object.hasOwn(mono.colors, key));
  console.log(contribution.label, {
    original: keys(mono.colors).length,
    experimental: keys(colors).length,
    added: difference(colors, mono.colors).length,
    removed: difference(mono.colors, colors).length,
    recolored: common.filter(key => colors[key].toLowerCase() !== mono.colors[key].toLowerCase()).length,
  });
  for (const [label, fg, bg, base, minimum] of pairs) {
    const backdrop = composite(colors[bg], rgba(colors[base]));
    const ratio = contrast(composite(colors[fg], backdrop), backdrop);
    assert(ratio >= minimum, `${name} / ${label}: ${ratio.toFixed(2)} < ${minimum}`);
    console.log(label, ratio.toFixed(2));
  }
  const match = composite(colors['editor.findMatchBackground'], rgba(colors['editor.background']));
  const comment = theme.tokenColors[0].settings.foreground;
  const commentRatio = contrast(composite(comment, match), match);
  assert(commentRatio >= 4.5, `${name} / Comentário no resultado atual: ${commentRatio.toFixed(2)} < 4.5`);
  console.log('Comentário no resultado atual', commentRatio.toFixed(2));
}
