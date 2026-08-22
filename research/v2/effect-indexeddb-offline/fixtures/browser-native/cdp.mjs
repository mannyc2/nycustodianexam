import fs from 'node:fs';
const port=9224, base=`http://127.0.0.1:${port}`;
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function waitJson(url){for(let i=0;i<80;i++){try{const r=await fetch(url);if(r.ok)return await r.json()}catch{}await sleep(100)}throw new Error('CDP unavailable '+url)}
class CDP{constructor(ws){this.ws=new WebSocket(ws);this.id=0;this.pending=new Map();this.events=[];this.ready=new Promise((res,rej)=>{this.ws.onopen=res;this.ws.onerror=rej});this.ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}}else this.events.push(m)}}async send(method,params={}){await this.ready;const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}async eval(expression,awaitPromise=true){const r=await this.send('Runtime.evaluate',{expression,awaitPromise,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+' '+(r.exceptionDetails.exception?.description||''));return r.result.value}close(){this.ws.close()}}
async function newPage(url){const r=await fetch(`${base}/json/new?${encodeURIComponent(url)}`,{method:'PUT'});const t=await r.json();const c=new CDP(t.webSocketDebuggerUrl);await c.ready;await c.send('Runtime.enable');await c.send('Page.enable');for(let i=0;i<80;i++){try{if(await c.eval('typeof window.R24!==\"undefined\"'))break}catch{}await sleep(100)}return {t,c}}
const version=await waitJson(`${base}/json/version`);
const p1=await newPage('file:///tmp/r24/probe.html');
const single=await p1.c.eval('window.R24.runSingle()');
// reset a dedicated race id but preserve DB schema
const racePayload={attemptId:'race-1',sessionId:'race-session',questionId:'race-q',profileVersion:'p1',packVersion:'v2',position:0,answer:'A',correct:true,committedAt:'2026-08-21T22:05:00Z'};
const p2=await newPage('file:///tmp/r24/probe.html');
const expr=`window.R24.commitAttempt(${JSON.stringify(racePayload)})`;
const race=await Promise.all([p1.c.eval(expr),p2.c.eval(expr)]);
const raceCount=await p1.c.eval(`window.R24.all('attemptEvents').then(xs=>xs.filter(x=>x.attemptId==='race-1').length)`);
// BroadcastChannel: establish listener on p2 before p1 sends
await p2.c.eval(`new Promise(resolve=>{const ch=new BroadcastChannel('r24-bc');ch.onmessage=e=>{globalThis.__bc=e.data;ch.close();resolve(true)};globalThis.__bcReady=true})`,false);
await sleep(100);await p1.c.eval(`(()=>{const ch=new BroadcastChannel('r24-bc');ch.postMessage({kind:'progressInvalidated',generation:2});ch.close();return true})()`);await sleep(200);const bc=await p2.c.eval('globalThis.__bc');
// Web Locks exclusivity across pages. p1 holds for 300ms; p2 starts after signal.
const lock1=p1.c.eval(`navigator.locks.request('r24-pack-install',async()=>{globalThis.__lock1Start=performance.now();await window.R24.sleep(300);globalThis.__lock1End=performance.now();return {start:globalThis.__lock1Start,end:globalThis.__lock1End}})`);
await sleep(50);
const lock2=p2.c.eval(`navigator.locks.request('r24-pack-install',async()=>({acquired:performance.now()}))`);
const [l1,l2]=await Promise.all([lock1,lock2]);
const result={cdp:{browser:version.Browser,protocolVersion:version['Protocol-Version'],userAgent:version['User-Agent']},single,twoTabDuplicate:{results:race,eventCount:raceCount,pass:raceCount===1&&race.some(x=>x.status==='committed')&&race.some(x=>x.status!=='committed')},broadcastChannel:{received:bc,pass:bc?.kind==='progressInvalidated'&&bc?.generation===2},webLocks:{first:l1,second:l2,exclusive:l2.acquired>=l1.end-5}};
fs.writeFileSync('/tmp/r24/result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));p1.c.close();p2.c.close();
