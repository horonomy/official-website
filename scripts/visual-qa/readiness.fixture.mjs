import {createServer} from 'node:http';

/** Loopback-only browser fixture with real delayed, missing and unrelated requests. */
export async function readinessFixture() {
  let released=false;
  const waitingImages=[],seen=new Set(),waiters=new Map(),unrelated=new Set();
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#00ddaa"/></svg>';
  const image=response=>{response.writeHead(200,{'Content-Type':'image/svg+xml'});response.end(svg);};
  const server=createServer((request,response)=>{
    const path=new URL(request.url,'http://127.0.0.1').pathname;
    seen.add(path);waiters.get(path)?.();
    if(request.method!=='GET'){response.writeHead(405);response.end();return;}
    if(path==='/unrelated'){
      response.writeHead(200,{'Content-Type':'text/plain'});response.write('Pending unrelated fetch');
      unrelated.add(response);response.on('close',()=>unrelated.delete(response));return;
    }
    if(path==='/asset.svg'){
      if(released)image(response);else waitingImages.push(response);
      return;
    }
    if(path==='/fixture.css'){
      response.writeHead(200,{'Content-Type':'text/css'});
      response.end('body{background:#101216;color:white;font:20px sans-serif}h1{color:#00ddaa}.art{width:40px;height:40px}');return;
    }
    if(!['/ready','/missing-image','/missing-background','/missing-style','/missing-font','/degraded'].includes(path)){
      response.writeHead(404);response.end('Required fixture resource missing');return;
    }
    const missing=path==='/missing-image'||path==='/missing-background'||path==='/degraded';
    const asset=missing?'/missing.svg':'/asset.svg';
    const font=path==='/missing-font'||path==='/degraded'?'<style>@font-face{font-family:Required;src:url(/missing.woff2)}h1{font-family:Required,sans-serif}</style>':'';
    const img=path==='/missing-background'?'':`<img alt="Required diagram" width="40" height="40" src="${asset}">`;
    response.writeHead(200,{'Content-Type':'text/html'});
    response.end(`<!doctype html><html lang="en"><head><title>Required render fixture</title><link rel="stylesheet" href="${path==='/missing-style'?'/missing.css':'/fixture.css'}">${font}</head><body><h1>Required content</h1>${img}<div class="art" style="background-image:url(${asset})"></div><a href="#content" id="content">Available action</a><script>fetch('/unrelated').catch(()=>{});</script></body></html>`);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return {
    origin:'http://127.0.0.1:'+server.address().port,
    requested:path=>seen.has(path)?Promise.resolve():new Promise(resolve=>waiters.set(path,resolve)),
    releaseImage:()=>{released=true;for(const response of waitingImages.splice(0))image(response);},
    unrelatedPending:()=>unrelated.size,
    close:()=>new Promise((resolve,reject)=>{server.close(error=>error?reject(error):resolve());server.closeAllConnections();}),
  };
}
