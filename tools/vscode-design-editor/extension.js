const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const http = require('http');

const defaults = {
  bg: '#f7f7f5', white: '#ffffff', text: '#111111', muted: '#606060',
  line: '#e9e9e7', accent: '#44445b', soft: '#edf0ff',
  buttonRadius: 999, buttonHeight: 46, buttonPadding: 18,
  cardRadius: 22, sectionSpacing: 92, bodySize: 16
};

function activate(context) {
  const command = vscode.commands.registerCommand('byttehmd.openDesignEditor', async () => {
    // In an Extension Development Host VS Code can start without opening the
    // development workspace. Resolve the project from this extension's own path.
    const extensionRoot = path.resolve(context.extensionPath, '..', '..');
    const folderRoot = vscode.workspace.workspaceFolders?.find(folder =>
      fs.existsSync(path.join(folder.uri.fsPath, 'index.html'))
    )?.uri.fsPath;
    const root = folderRoot || extensionRoot;
    const htmlPath = path.join(root, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      vscode.window.showErrorMessage('Не нашёл index.html рядом с редактором. Откройте папку проекта bytteh-website.');
      return;
    }
    const projectUri = vscode.Uri.file(root);
    const cssPath = path.join(root, 'design-overrides.css');
    let previewServer;
    try {
      previewServer = await startPreviewServer(root);
    } catch (error) {
      vscode.window.showErrorMessage(`Не удалось запустить локальный предпросмотр: ${error.message}`);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'byttehmdDesignEditor', 'BYTTEHMD — Дизайн сайта', vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [projectUri] }
    );
    panel.webview.html = getHtml(panel.webview, previewServer.url);
    panel.onDidDispose(() => previewServer.server.close());

    panel.webview.onDidReceiveMessage(async message => {
      if (message.type === 'ready') {
        const settings = readSettings(cssPath);
        panel.webview.postMessage({ type: 'settings', settings, preview: previewServer.url });
      }
      if (message.type === 'save') {
        try {
          fs.writeFileSync(cssPath, makeCss(message.settings), 'utf8');
          if (!fs.readFileSync(htmlPath, 'utf8').includes('design-overrides.css')) {
            const source = fs.readFileSync(htmlPath, 'utf8');
            fs.writeFileSync(htmlPath, source.replace('</head>', '<link rel="stylesheet" href="./design-overrides.css">\n</head>'), 'utf8');
          }
          panel.webview.postMessage({ type: 'saved', preview: previewServer.url });
        } catch (error) {
          vscode.window.showErrorMessage(`Не удалось сохранить дизайн: ${error.message}`);
        }
      }
      if (message.type === 'reset') {
        try {
          fs.writeFileSync(cssPath, makeCss(defaults), 'utf8');
          panel.webview.postMessage({ type: 'settings', settings: defaults, preview: previewServer.url });
          vscode.window.showInformationMessage('Исходные настройки дизайна восстановлены.');
        } catch (error) {
          vscode.window.showErrorMessage(`Не удалось восстановить дизайн: ${error.message}`);
        }
      }
      if (message.type === 'openFile') {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(htmlPath));
        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      }
    });
  });
  context.subscriptions.push(command);
}

function readSettings(file) {
  try {
    const css = fs.readFileSync(file, 'utf8');
    const values = { ...defaults };
    const map = { bg: '--bg', white: '--white', text: '--text', muted: '--muted', line: '--line', accent: '--accent', soft: '--soft' };
    for (const [key, token] of Object.entries(map)) {
      const match = css.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,8})`));
      if (match) values[key] = match[1];
    }
    const nums = { buttonRadius: '--site-button-radius', buttonHeight: '--site-button-height', buttonPadding: '--site-button-padding', cardRadius: '--site-card-radius', sectionSpacing: '--site-section-spacing', bodySize: '--site-body-size' };
    for (const [key, token] of Object.entries(nums)) {
      const match = css.match(new RegExp(`${token}:\\s*(\\d+(?:\\.\\d+)?)`));
      if (match) values[key] = Number(match[1]);
    }
    return values;
  } catch { return { ...defaults }; }
}

function makeCss(raw) {
  const s = { ...defaults, ...raw };
  const color = value => /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#44445b';
  const number = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
  return `/* Настройки из визуального редактора BYTTEHMD. */\n:root {\n` +
    `  --bg: ${color(s.bg)};\n  --white: ${color(s.white)};\n  --text: ${color(s.text)};\n  --muted: ${color(s.muted)};\n  --line: ${color(s.line)};\n  --accent: ${color(s.accent)};\n  --soft: ${color(s.soft)};\n` +
    `  --site-button-radius: ${number(s.buttonRadius, 0, 60)}px;\n  --site-button-height: ${number(s.buttonHeight, 32, 80)}px;\n  --site-button-padding: ${number(s.buttonPadding, 8, 48)}px;\n` +
    `  --site-card-radius: ${number(s.cardRadius, 0, 60)}px;\n  --site-section-spacing: ${number(s.sectionSpacing, 32, 140)}px;\n  --site-body-size: ${number(s.bodySize, 13, 22)}px;\n}\n` +
    `body { font-size: var(--site-body-size); }\n.nav-cta,.btn,.btn-light,.mini-btn,.form button { border-radius:var(--site-button-radius)!important; }\n` +
    `.nav-cta,.btn,.btn-light { min-height:var(--site-button-height)!important; padding-inline:var(--site-button-padding)!important; }\n` +
    `.feature,.product,.stat,.brand-box,.visual-panel,.cta-block { border-radius:var(--site-card-radius)!important; }\n.section { padding-block:var(--site-section-spacing)!important; }\n` +
    `html[data-theme="light"] { --bg:${color(s.bg)}; --white:${color(s.white)}; --text:${color(s.text)}; --muted:${color(s.muted)}; --line:${color(s.line)}; --accent:${color(s.accent)}; --soft:${color(s.soft)}; }\n`;
}

function startPreviewServer(root) {
  const contentTypes = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
  };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const blocked = relative.split(/[\\/]/).some(part => part.startsWith('.') || ['api', 'functions', 'tools', 'node_modules'].includes(part));
    const file = path.resolve(root, relative);
    const rel = path.relative(root, file);
    if (blocked || rel.startsWith('..') || path.isAbsolute(rel) || !contentTypes[path.extname(file).toLowerCase()]) {
      response.writeHead(404).end('Not found');
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, {
        'Content-Type': contentTypes[path.extname(file).toLowerCase()],
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }).end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}/` });
    });
  });
}

function getHtml(webview, previewUrl) {
  const nonce = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
  const previewOrigin = new URL(previewUrl).origin;
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-src ${webview.cspSource} ${previewOrigin}; img-src ${webview.cspSource} ${previewOrigin} https: data:;"><title>BYTTEHMD Design Editor</title>
<style>
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;padding:18px;font:13px var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background)}header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}h1{font-size:18px;margin:0}.sub{opacity:.72;margin-top:4px}.layout{display:grid;grid-template-columns:minmax(260px,340px) minmax(350px,1fr);gap:16px;min-height:calc(100vh - 82px)}.controls,.preview{border:1px solid var(--vscode-panel-border);border-radius:10px;background:var(--vscode-sideBar-background);padding:14px}.controls{overflow:auto}.preview{padding:0;overflow:hidden;display:flex;flex-direction:column}.preview-head{padding:10px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--vscode-panel-border)}iframe{width:100%;height:100%;min-height:620px;border:0;background:#fff}.group-title{margin:14px 0 8px;font-weight:700}.control{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;margin:9px 0}.control label{line-height:1.3}.control input[type=color]{width:40px;height:30px;padding:2px;border:1px solid var(--vscode-input-border);background:var(--vscode-input-background);border-radius:5px}.control input[type=range]{grid-column:1 / -1;width:100%;accent-color:var(--vscode-button-background)}.value{min-width:43px;text-align:right;opacity:.75;font-variant-numeric:tabular-nums}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}button{font:inherit;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;border-radius:5px;padding:7px 11px;cursor:pointer}button:hover{background:var(--vscode-button-hoverBackground)}button.secondary{color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground)}.hint{opacity:.7;line-height:1.5;margin-top:12px}.status{min-height:20px;margin-top:8px;color:var(--vscode-testing-iconPassed)}@media(max-width:800px){.layout{grid-template-columns:1fr}.preview{min-height:600px}iframe{min-height:620px}}
</style></head><body><header><div><h1>Дизайн BYTTEHMD</h1><div class="sub">Настройте внешний вид и сразу смотрите сайт справа.</div></div><button class="secondary" id="open">Открыть index.html</button></header>
<div class="layout"><section class="controls"><div class="group-title">Цвета</div>
${[['bg','Фон страницы'],['white','Фон карточек'],['text','Основной текст'],['muted','Вторичный текст'],['line','Границы'],['accent','Акцент и кнопки'],['soft','Мягкий фон меток']].map(([k,l])=>`<div class="control"><label for="${k}">${l}</label><input id="${k}" type="color"></div>`).join('')}
<div class="group-title">Размеры</div>
${[['buttonRadius','Скругление кнопок',0,60,'px'],['buttonHeight','Высота кнопок',32,80,'px'],['buttonPadding','Ширина кнопок',8,48,'px'],['cardRadius','Скругление карточек',0,60,'px'],['sectionSpacing','Отступы между секциями',32,140,'px'],['bodySize','Размер текста',13,22,'px']].map(([k,l,min,max,u])=>`<div class="control"><label for="${k}">${l}</label><span class="value" id="${k}Value"></span><input id="${k}" type="range" min="${min}" max="${max}" step="1" data-unit="${u}"></div>`).join('')}
<div class="actions"><button id="save">Сохранить дизайн</button><button class="secondary" id="reset">Вернуть исходный дизайн</button></div><div class="status" id="status"></div><div class="hint">Изменения сохраняются в <code>design-overrides.css</code>. Чтобы опубликовать сайт, отправьте изменения проекта в GitHub — Cloudflare обновит сайт.</div></section>
<section class="preview"><div class="preview-head"><strong>Предпросмотр сайта</strong><button class="secondary" id="refresh">Обновить</button></div><iframe title="Предпросмотр BYTTEHMD" src="${previewUrl}"></iframe></section></div>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi();const keys=['bg','white','text','muted','line','accent','soft','buttonRadius','buttonHeight','buttonPadding','cardRadius','sectionSpacing','bodySize'];let timer;function value(k){const el=document.getElementById(k);return el.type==='color'?el.value:Number(el.value)}function set(s){for(const k of keys){const el=document.getElementById(k);if(s[k]!==undefined)el.value=s[k];if(el.type==='range')document.getElementById(k+'Value').textContent=el.value+el.dataset.unit}draw(false)}function current(){return Object.fromEntries(keys.map(k=>[k,value(k)]))}function draw(autosave=true){const s=current(),root=document.documentElement.style;for(const [k,v] of Object.entries({bg:s.bg,white:s.white,text:s.text,muted:s.muted,line:s.line,accent:s.accent,soft:s.soft}))root.setProperty('--'+k,v);root.setProperty('--radius',s.buttonRadius+'px');document.querySelectorAll('.value').forEach((n)=>{const k=n.id.replace('Value','');n.textContent=document.getElementById(k).value+document.getElementById(k).dataset.unit});if(autosave){document.getElementById('status').textContent='Предпросмотр обновляется…';clearTimeout(timer);timer=setTimeout(()=>vscode.postMessage({type:'save',settings:current()}),650)}}keys.forEach(k=>document.getElementById(k).addEventListener('input',()=>draw()));document.getElementById('save').onclick=()=>{clearTimeout(timer);vscode.postMessage({type:'save',settings:current()})};document.getElementById('reset').onclick=()=>vscode.postMessage({type:'reset'});document.getElementById('refresh').onclick=()=>{const f=document.querySelector('iframe');f.src=f.src.split('?')[0]+'?refresh='+Date.now()};document.getElementById('open').onclick=()=>vscode.postMessage({type:'openFile'});window.addEventListener('message',e=>{if(e.data.type==='settings'){set(e.data.settings);if(e.data.preview)document.querySelector('iframe').src=e.data.preview}if(e.data.type==='saved'){document.getElementById('status').textContent='Сохранено в design-overrides.css';const f=document.querySelector('iframe');f.src=e.data.preview+'?refresh='+Date.now()}});vscode.postMessage({type:'ready'});
</script></body></html>`;
}

function deactivate() {}
module.exports = { activate, deactivate };
