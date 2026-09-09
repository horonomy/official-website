/** Local production files only; never reuse an unrelated server or expose the checkout. */
import {createServer} from 'node:http';
import {readFile, realpath, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';

const roots = [[4174, 'build'], [4175, 'atlas/dist']];
const mime = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2', '.ico':'image/x-icon'};
const servers = [];
for (const [port, dir] of roots) {
  const root = await realpath(dir);
  await stat(resolve(root, 'index.html'));
  const server = createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let file = resolve(root, '.' + pathname);
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      file = await realpath(file);
      if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      res.writeHead(200, {'Content-Type':mime[extname(file)] ?? 'application/octet-stream', 'Cache-Control':'no-store'});
      res.end(req.method === 'HEAD' ? undefined : await readFile(file));
    } catch { res.writeHead(404).end('Not found'); }
  });
  await new Promise((ready, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', ready); });
  servers.push(server);
}
console.log('Visual QA production servers ready on loopback ports 4174 and 4175');
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { for (const server of servers) server.close(); });

// Playwright launches its server in a separate process group. A cancelled outer
// command must not leave that detached group occupying the next run's ports.
if(process.env.QA_SERVER_OWNER) {
  const owner=Number(process.env.QA_SERVER_OWNER);
  if(!Number.isSafeInteger(owner)||owner<=0)throw new Error('Invalid QA server owner');
  const watchdog=setInterval(()=>{
    try {process.kill(owner,0);}
    catch {for(const server of servers)server.closeAllConnections();process.exit(1);}
  },1000);
  watchdog.unref();
}
