const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const source = require('./upstream/source.json');

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const upstream = Object.fromEntries(Object.entries(source.sha256).map(([file, hash]) => {
  const bytes = fs.readFileSync(path.join(__dirname, 'upstream', file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, file);
  return [file, JSON.parse(bytes)];
}));

function resolve(file, chain = []) {
  assert(!chain.includes(file), 'Cyclic theme include');
  const current = upstream[file];
  assert(current && !current.settings, file);
  const parent = current.include
    ? resolve(path.posix.normalize(current.include), [...chain, file])
    : { colors: {}, tokenColors: [], semanticRules: [], semanticHighlighting: false };
  assert(!current.tokenColors || Array.isArray(current.tokenColors), file);
  const colors = { ...parent.colors };
  for (const [key, value] of Object.entries(current.colors ?? {})) {
    if (value === 'default') delete colors[key];
    else colors[key] = value;
  }
  return {
    colors,
    tokenColors: [...parent.tokenColors, ...current.tokenColors ?? []],
    semanticRules: [...parent.semanticRules, ...Object.entries(current.semanticTokenColors ?? {})],
    semanticHighlighting: parent.semanticHighlighting || current.semanticHighlighting === true,
  };
}

// Group the resolved Dark Modern colors by role. Token overrides below handle
// workbench roles that happen to share an upstream hex value.
const roles = {
  chrome: '181818', canvas: '1f1f1f', popup: '202020 222222',
  raised: '313131 3c3c3c', separator: '252526 2b2b2b 303031 21262d',
  edge: '454545 404040', strongEdge: '707070 616161',
  deepest: '010409', text: 'cccccc d7d7d7 d0d0d0',
  strongText: 'fff ffffff f8f8f8', muted: '9d9d9d 989898',
  subdued: '868686 6e7681', accent: '0078d4 007acc 2488db',
  accentHover: '026ec1', accentLight: '6caddf 4daafc 85b6ff',
  selected: '37373d 3a3d41 383a49 383b3d', transparent: '00000000',
  pressed: '2489db82', chatChip: '26477866', find: '9e6a03',
  findSoft: 'bb800966', warning: 'e2c08d', success: '2ea043 369432',
  error: 'f85149', softDivider: 'ffffff17', pinnedDivider: 'ccc3',
  buttonEdge: 'ffffff1a', hover: 'ffffff11', active: 'ffffff22 f1f1f133',
  selectionTint: 'add6ff26', prominent: '6e768166',
};
const roleByColor = Object.fromEntries(
  Object.entries(roles).flatMap(([role, values]) =>
    values.split(' ').map(value => ['#' + value, role])),
);
const roleByToken = {
  'editorGroupHeader.connectedTabsBackground': 'connected',
  'checkbox.border': 'edge',
  'dropdown.border': 'edge',
  'input.border': 'controlEdge',
  'settings.dropdownBorder': 'edge',
  'pickerGroup.border': 'edge',
  'menu.selectionBackground': 'pressed',
  'button.foreground': 'onAccent',
  'activityBarBadge.foreground': 'onAccent',
  'statusBar.debuggingBackground': 'statusAccent',
  'statusBar.debuggingForeground': 'onAccent',
  'statusBarItem.remoteBackground': 'statusAccent',
  'statusBarItem.remoteForeground': 'onAccent',
  'editorGutter.modifiedBackground': 'warning',
  'textBlockQuote.background': 'raised',
  'textCodeBlock.background': 'raised',
  'tab.selectedBorderTop': 'selectedAccent',
  'settings.modifiedItemIndicator': 'warning',
};
const syntaxColors = [
  'editorBracketMatch.background',
  'editorBracketMatch.border',
  'editorWhitespace.foreground',
];
const monoMinDarkModernTabs = new Set([
  'editorGroupHeader.connectedTabsBackground',
  'editorGroupHeader.tabsBorder',
  'tab.border',
  'tab.inactiveForeground',
  'panelTitle.inactiveForeground',
]);
// These colors are supplied by the installed workbench for Dark Modern.
// Make the palette explicit where the registry otherwise supplies hard-coded hues.
const workbenchDefaults = {
  disabledForeground: 'disabled',
  'editor.selectionBackground': 'selectionTint',
  'editor.findMatchHighlightBackground': 'findOther',
  'list.activeSelectionBackground': 'pressed',
  'list.hoverBackground': 'hover',
  'list.highlightForeground': 'accentLight',
  'editorError.foreground': 'error',
  'editorWarning.foreground': 'warning',
  'inputValidation.errorBackground': 'errorTint',
  'inputValidation.errorBorder': 'error',
  'inputValidation.warningBackground': 'warningTint',
  'inputValidation.warningBorder': 'warning',
};

function generate(name, darkModern) {
  const mono = read(path.join(__dirname, 'originals', name + 'Theme.json'));
  const c = mono.colors;
  const dracula = name === 'MonoDracula';
  const text = c.foreground;
  const statusAccent = c.focusBorder;
  const accent = dracula ? statusAccent : c['terminal.ansiYellow'];
  const marker = dracula ? c['editorWarning.foreground'] : '#888888';
  const tint = (color, alpha) => color.slice(0, 7) + alpha;
  const palette = {
    chrome: c['sideBar.background'], canvas: c['editor.background'],
    popup: dracula ? '#303442' : '#303030', raised: c['tab.border'],
    separator: dracula ? '#303442' : '#303030', connected: c['tab.border'],
    edge: c['menu.border'], strongEdge: dracula ? '#6272a4' : '#888888',
    controlEdge: '#939293', deepest: dracula ? '#14141b' : '#101010',
    text, strongText: text, muted: c.descriptionForeground,
    subdued: '#939293', disabled: c.disabledForeground, accent, statusAccent, onAccent: c['button.foreground'],
    accentHover: dracula ? c['button.hoverBackground'] : tint(accent, 'e6'),
    accentLight: dracula ? c['textLink.foreground'] : accent, selectedAccent: '#939293',
    selected: c['menu.border'], transparent: '#00000000',
    pressed: tint(accent, '40'), chatChip: tint(accent, '26'),
    find: dracula ? '#14141b' : '#101010', findOther: tint(dracula ? marker : accent, '26'),
    findSoft: tint(marker, '40'), findEdge: dracula ? marker : '#939293',
    warning: c['editorWarning.foreground'], success: c['editorGutter.addedBackground'],
    error: c.errorForeground, errorTint: tint(c.errorForeground, '26'),
    warningTint: tint(c['editorWarning.foreground'], '26'), softDivider: tint(text, '17'),
    pinnedDivider: tint(text, '33'), buttonEdge: tint(c['button.foreground'], '1a'),
    hover: tint(text, '11'), active: tint(text, '26'),
    selectionTint: tint(accent, '26'), prominent: tint(text, '33'),
  };
  const colors = Object.fromEntries(Object.entries(darkModern.colors).map(([key, value]) => {
    if (!dracula && monoMinDarkModernTabs.has(key)) return [key, value];
    const role = roleByToken[key] ?? roleByColor[value.toLowerCase()];
    assert(palette[role], `Unmapped color ${key} (${value})`);
    return [key, palette[role]];
  }));
  for (const [key, role] of Object.entries(workbenchDefaults)) {
    assert(!Object.hasOwn(colors, key), `Now supplied by the theme: ${key}`);
    colors[key] = palette[role];
  }
  // A dark fill keeps low-luminance syntax readable. The edge makes the current
  // hit distinguishable without lifting the fill behind comments.
  colors['editor.findMatchBorder'] = palette.findEdge;
  for (const key of syntaxColors) colors[key] = c[key];
  delete colors['terminal.inactiveSelectionBackground'];
  for (const [key, value] of Object.entries(c)) {
    if (key.startsWith('terminal.ansi') || key === 'terminal.background' || key === 'terminal.selectionBackground') {
      colors[key] = value.toUpperCase();
    }
  }
  if (dracula) colors['terminal.ansiBrightBlack'] = '#939293';
  colors['terminal.findMatchBorder'] = accent.toUpperCase();
  colors['terminalOverviewRuler.findMatchForeground'] = accent.toUpperCase();
  assert(Array.isArray(mono.tokenColors), name);
  return { $schema: mono.$schema, name: name + ' Experimental', type: mono.type, colors,
    tokenColors: mono.tokenColors,
    ...Object.fromEntries(['semanticHighlighting', 'semanticTokenColors']
      .filter(key => Object.hasOwn(mono, key)).map(key => [key, mono[key]])),
  };
}

const darkModern = resolve('dark_modern.json');
if (require.main === module) {
  const variants = ['MonoMin', 'MonoDracula'];
  const args = process.argv.slice(2);
  const official = args.includes('--official');
  const requested = args.filter(arg => arg !== '--check' && arg !== '--official');
  assert(requested.every(name => variants.includes(name)), 'Use MonoMin or MonoDracula');
  for (const name of requested.length ? requested : variants) {
    const experimental = path.join(__dirname, 'extension', 'themes', name + 'Experimental.json');
    const file = official ? path.join(__dirname, '../../../themes', name + 'Theme.json') : experimental;
    const theme = official ? { ...read(experimental), name } : generate(name, darkModern);
    const generated = JSON.stringify(theme, null, official ? '\t' : 2) + '\n';
    if (process.argv.includes('--check')) {
      assert.equal(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), generated, file);
    }
    else fs.writeFileSync(file, generated);
  }
}
module.exports = { darkModern, syntaxColors, workbenchDefaults, monoMinDarkModernTabs };
