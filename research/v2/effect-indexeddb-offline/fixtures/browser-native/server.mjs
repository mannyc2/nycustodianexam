import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'.';const port=Number(process.argv[3]||4173);
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://x').pathname;const f=path.join(root,p==='/'?'probe.html':p.slice(1));try{const data=fs.readFileSync(f);res.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html','cache-control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('not found')}});server.listen(port,'127.0.0.1',()=>console.log(`LISTEN ${port}`));
