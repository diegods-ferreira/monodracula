'use strict';
// Somente leitura. Não gera/instala VSIX, não extrai arquivos no disco.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yauzl = require('yauzl');
const jsonc = require('jsonc-parser');
const repo = path.resolve(process.env.MONODRACULA_REPO || path.join(__dirname, '..'));

function entries(file) {
  return new Promise((resolve, reject) => yauzl.open(file, { lazyEntries: true }, (error, zip) => {
    if (error) return reject(error);
    const values = new Map();
    let size = 0;
    const fail = error => { zip.close(); reject(error); };
    zip.on('error', fail);
    zip.on('end', () => resolve(values));
    zip.on('entry', entry => {
      if (entry.fileName.endsWith('/')) return zip.readEntry();
      if (/^(?:\/|[A-Za-z]:)/.test(entry.fileName) || /(^|\/)\.\.(\/|$)/.test(entry.fileName) || values.has(entry.fileName)) {
        return fail(new Error('Entrada ZIP inválida/duplicada: ' + entry.fileName));
      }
      size += entry.uncompressedSize;
      if (size > 32 * 1024 * 1024) return fail(new Error('Pacote excede limite de leitura de 32 MiB; revisar explicitamente'));
      zip.openReadStream(entry, (error, stream) => {
        if (error) return fail(error);
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', fail);
        stream.on('end', () => { values.set(entry.fileName, Buffer.concat(chunks)); zip.readEntry(); });
      });
    });
    zip.readEntry();
  }));
}

test('VSIX: manifesto, temas e ausência de dependência Dark Modern', {
  skip: !process.env.VSIX_FILE && 'Pendente: fornecer VSIX_FILE explicitamente'
}, async () => {
  const zip = await entries(path.resolve(process.env.VSIX_FILE));
  const manifest = zip.get('extension/package.json');
  assert(manifest, 'Manifesto ausente');
  assert(manifest.equals(fs.readFileSync(path.join(repo, 'package.json'))));
  const pkg = JSON.parse(manifest.toString('utf8'));
  assert.equal(pkg.version, '2.3.6');
  for (const theme of pkg.contributes.themes) {
    const relative = theme.path.replace(/^\.\//, '');
    assert(!relative.includes('..') && !path.isAbsolute(relative));
    const bytes = zip.get('extension/' + relative);
    assert(bytes && bytes.equals(fs.readFileSync(path.join(repo, relative))), relative);
    assert(!Object.hasOwn(jsonc.parse(bytes.toString('utf8')), 'include'));
  }
  assert(zip.has('extension/' + pkg.icon));
  assert(zip.has('[Content_Types].xml') && zip.has('extension.vsixmanifest'));
  const license = zip.get('extension/LICENSE-VSCODE.txt');
  assert(license && license.equals(fs.readFileSync(path.join(repo, 'LICENSE-VSCODE.txt'))));
  for (const name of zip.keys()) {
    assert(!name.startsWith('extension/docs/'), name);
    assert(!name.endsWith('/dark-modern-ui.colors.json'), name);
  }
  if (process.env.CLEAN_VSIX === '1') {
    const expected = [
      '[Content_Types].xml', 'extension.vsixmanifest', 'extension/package.json',
      'extension/readme.md', 'extension/changelog.md', 'extension/LICENSE-VSCODE.txt',
      'extension/' + pkg.icon,
      ...pkg.contributes.themes.map(theme => 'extension/' + theme.path.replace(/^\.\//, '')),
    ];
    assert.deepEqual([...zip.keys()].sort(), expected.sort());
  }
});
