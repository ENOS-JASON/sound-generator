/**
 * AG-M0-02 Pages checks. Static and HTTPS preview run before merge;
 * public live checks run only after GitHub Pages reports a deployment.
 */
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { createServer, get } from 'node:https';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const sitePath = '/sound-generator/';
const outputDirectory = resolve('dist');

function verifyStaticArtifact() {
  const indexPath = join(outputDirectory, 'index.html');
  assert.ok(existsSync(indexPath), 'Vite build must produce dist/index.html');
  const html = readFileSync(indexPath, 'utf8');
  assert.match(html, /<title>Sound Generator<\/title>/);
  assert.doesNotMatch(
    html,
    /src=["']\/src\//,
    'development scripts cannot ship',
  );
  const assets = [
    ...html.matchAll(/(?:src|href)="(\/sound-generator\/assets\/[^"]+)"/g),
  ].map((match) => match[1]);
  assert.ok(assets.length >= 2, 'compiled JS and CSS must use the Pages base');
  for (const asset of assets) {
    const localFile = resolve(outputDirectory, asset.slice(sitePath.length));
    assert.ok(
      localFile.startsWith(outputDirectory + sep),
      'asset escaped dist/',
    );
    assert.ok(existsSync(localFile), `missing compiled asset: ${asset}`);
  }
  assert.ok(
    assets.some((asset) => asset.endsWith('.js')),
    'JS asset required',
  );
  assert.ok(
    assets.some((asset) => asset.endsWith('.css')),
    'CSS asset required',
  );
  console.log(
    `PASS: nested base paths and ${assets.length} local assets; no /src/ references`,
  );
  return assets;
}

function findChrome() {
  for (const executable of [
    process.env.CHROME_BIN,
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
  ]) {
    if (!executable) continue;
    try {
      execFileSync(executable, ['--version'], { stdio: 'ignore' });
      return executable;
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error(
    'Chromium/Chrome executable unavailable: HTTPS browser check cannot pass',
  );
}

function serveFile(request, response) {
  const url = new URL(request.url ?? '/', 'https://localhost');
  if (!url.pathname.startsWith(sitePath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  let relativePath;
  try {
    relativePath = decodeURIComponent(url.pathname.slice(sitePath.length));
  } catch {
    response.writeHead(400);
    response.end('Invalid path');
    return;
  }
  const filePath = resolve(outputDirectory, relativePath || 'index.html');
  if (!filePath.startsWith(outputDirectory + sep) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  if (!statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const contentType =
    {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
    }[extname(filePath)] ?? 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': contentType });
  response.end(readFileSync(filePath));
}

function getLocalStatus(url) {
  return new Promise((resolveStatus, reject) => {
    get(url, { rejectUnauthorized: false }, (response) => {
      response.resume();
      response.on('end', () => resolveStatus(response.statusCode));
    }).on('error', reject);
  });
}

async function verifyHttpsPreview() {
  verifyStaticArtifact();
  const chrome = findChrome();
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'ag-m0-02-pages-'));
  const keyPath = join(temporaryDirectory, 'key.pem');
  const certPath = join(temporaryDirectory, 'cert.pem');
  let server;
  try {
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-keyout',
        keyPath,
        '-out',
        certPath,
        '-days',
        '1',
        '-subj',
        '/CN=localhost',
      ],
      { stdio: 'ignore' },
    );
    server = createServer(
      { key: readFileSync(keyPath), cert: readFileSync(certPath) },
      serveFile,
    );
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `https://127.0.0.1:${address.port}`;
    assert.equal(await getLocalStatus(`${origin}${sitePath}`), 200);
    assert.equal(await getLocalStatus(`${origin}${sitePath}drive`), 404);

    for (const [fragment, heading] of [
      ['#/drive', 'Drive'],
      ['#/drive', 'Drive'], // Fresh browser navigation = refresh-equivalent.
      ['#/diagnostics', 'Diagnostics'],
      ['#/settings', 'Settings'],
      ['#/missing', 'Unknown route'], // Invalid-path behavior.
    ]) {
      const profileDirectory = join(
        temporaryDirectory,
        `profile-${fragment.slice(2)}-${Math.random().toString(36).slice(2)}`,
      );
      const { stdout } = await execFileAsync(
        chrome,
        [
          '--headless=new',
          '--no-sandbox',
          '--ignore-certificate-errors',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-background-networking',
          '--no-first-run',
          '--virtual-time-budget=2500',
          `--user-data-dir=${profileDirectory}`,
          '--dump-dom',
          `${origin}${sitePath}${fragment}`,
        ],
        { timeout: 30000, maxBuffer: 8 * 1024 * 1024 },
      );
      assert.match(
        stdout,
        new RegExp(`<h1[^>]*>\\s*${heading}\\s*</h1>`),
        `HTTPS browser route ${fragment} did not render expected heading`,
      );
      console.log(
        `PASS: HTTPS headless browser ${fragment} renders ${heading}`,
      );
    }
    console.log(
      'PASS: HTTPS nested-path direct links, repeat-load, invalid route, no history fallback',
    );
  } finally {
    if (server) {
      await new Promise((done) => server.close(done));
    }
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

async function verifyPublicSite() {
  const rawUrl = process.env.PAGES_URL;
  assert.ok(rawUrl, 'PAGES_URL must be provided by deploy-pages');
  const base = new URL(rawUrl);
  assert.equal(base.protocol, 'https:', 'Pages must use HTTPS');
  assert.equal(base.pathname, sitePath, 'Expected project Pages base path');
  let latestError;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      for (const fragment of ['#/drive', '#/settings', '#/unrecognized']) {
        const response = await fetch(new URL(fragment, base), {
          cache: 'no-store',
        });
        assert.equal(
          response.status,
          200,
          `public route ${fragment} not reachable`,
        );
        const html = await response.text();
        assert.match(html, /<title>Sound Generator<\/title>/);
        const match = html.match(
          /(?:src|href)="(\/sound-generator\/assets\/[^"]+\.js)"/,
        );
        assert.ok(match, 'Page did not serve versioned Vite assets');
        const assetResponse = await fetch(new URL(match[1], base.origin));
        assert.equal(assetResponse.status, 200, 'public JS asset inaccessible');
        assert.match(
          assetResponse.headers.get('content-type') ?? '',
          /javascript/,
        );
      }
      console.log(
        `PASS: public unauthenticated HTTPS at ${base.href} with hash routes and JS assets`,
      );
      return;
    } catch (error) {
      latestError = error;
      if (attempt < 11) {
        await new Promise((done) => setTimeout(done, 5000));
      }
    }
  }
  throw latestError;
}

const mode = process.argv[2];
if (mode === 'static') {
  verifyStaticArtifact();
} else if (mode === 'https') {
  await verifyHttpsPreview();
} else if (mode === 'live') {
  await verifyPublicSite();
} else {
  throw new Error('Usage: node tests/pages-smoke.mjs static|https|live');
}
