'use strict';
// Somente leitura. Não atualiza fixtures, não abre VS Code, não executa Git.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const jsonc = require('jsonc-parser');
const repo = path.resolve(process.env.MONODRACULA_REPO || path.join(__dirname, '..'));
const approved = require('./fixtures/approved-themes.json');
const manifest = require('./fixtures/manifest.json');
const samples = require('./fixtures/syntax-samples.json');

function readJsonc(file) {
  const errors = [];
  const root = jsonc.parseTree(fs.readFileSync(file, 'utf8'), errors, {
    allowTrailingComma: true, disallowComments: false, allowEmptyContent: false
  });
  assert.deepEqual(errors, [], `${file}: JSONC inválido`);
  assert.equal(root.type, 'object', `${file}: raiz deve ser objeto`);
  function visit(node) {
    if (node.type === 'object') {
      const keys = new Set();
      for (const property of node.children || []) {
        const key = property.children[0].value;
        assert(!keys.has(key), `${file}: chave duplicada ${key}`);
        keys.add(key);
      }
    }
    for (const child of node.children || []) visit(child);
  }
  visit(root);
  // getNodeValue usa objetos sem prototype; normalize apenas a representação
  // JSON antes da igualdade estrita, preservando todos os valores e chaves.
  return JSON.parse(JSON.stringify(jsonc.getNodeValue(root)));
}

for (const [name, baseline] of Object.entries(approved.themes)) {
  test(`${name}: estrutura, syntax e cores aprovadas`, () => {
    const actual = readJsonc(path.join(repo, baseline.file));
    assert.equal(actual.tokenColors.length, 161);
    assert.deepEqual(actual.tokenColors, baseline.theme.tokenColors);
    for (const key of ['semanticHighlighting', 'semanticTokenColors']) {
      assert.equal(Object.hasOwn(actual, key), Object.hasOwn(baseline.theme, key));
      assert.deepEqual(actual[key], baseline.theme[key]);
    }
    assert(!Object.hasOwn(actual, 'include'), 'O tema deve ser autocontido');
    assert(!fs.existsSync(path.join(repo, 'themes/dark-modern-ui.colors.json')));
    for (const [key, value] of Object.entries(actual.colors)) {
      assert.match(value, /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i, key);
    }
    for (const rule of actual.tokenColors) {
      for (const key of ['foreground', 'background']) {
        if (rule.settings && Object.hasOwn(rule.settings, key)) {
          assert.match(rule.settings[key], /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i);
        }
      }
    }
    assert.deepEqual(actual, baseline.theme, 'Diferença em relação ao estado aprovado; não regenerar automaticamente');
    if (name === 'MonoDracula') {
      const comment = actual.tokenColors.find(rule => Array.isArray(rule.scope) && rule.scope.includes('comment'));
      assert.equal(comment.settings.foreground, '#797fa5');
      assert.equal(comment.settings.fontStyle, 'italic');
    }
  });
}

test('manifesto, versão e caminhos de produção', () => {
  const bytes = fs.readFileSync(path.join(repo, 'package.json'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), manifest.sha256);
  const actual = readJsonc(path.join(repo, 'package.json'));
  assert.deepEqual(actual, manifest.value);
  assert.equal(actual.version, '2.3.5');
  assert.equal(actual.contributes.themes.length, 2);
  for (const theme of actual.contributes.themes) {
    assert.equal(theme.uiTheme, 'vs-dark');
    assert(fs.existsSync(path.join(repo, theme.path)), theme.path);
  }
  assert(fs.existsSync(path.join(repo, actual.icon)));
});

test('fixtures das seis linguagens presentes; não equivale a executar provedores', () => {
  assert.deepEqual(Object.keys(samples).sort(), ['sample.css', 'sample.html', 'sample.js', 'sample.json', 'sample.md', 'sample.ts']);
  for (const text of Object.values(samples)) assert(text.length > 0);
});
