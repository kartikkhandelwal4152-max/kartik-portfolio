import test from 'node:test';import assert from 'node:assert/strict';import {createApp} from './app.js';
test('Contact validates input, saves only allowed fields, and CV routes return actual file formats',async()=>{let saved=[];const server=createApp({saveContact:async d=>saved.push(d),isReady:()=>true}).listen(0);await new Promise(r=>server.on('listening',r));const base=`http://127.0.0.1:${server.address().port}`;try{let r=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'K',email:'bad',message:'short'})});assert.equal(r.status,400);assert.equal(saved.length,0);r=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:' Test User ',email:'TEST@example.com',message:'This is a test message.',admin:true})});assert.equal(r.status,201);assert.deepEqual(saved,[{name:'Test User',email:'test@example.com',message:'This is a test message.'}]);for(const[format,magic]of [['pdf','%PDF'],['docx','PK']]){r=await fetch(base+'/api/resume/'+format);assert.equal(r.status,200);assert.match(r.headers.get('content-disposition'),/attachment/);const b=Buffer.from(await r.arrayBuffer());assert.equal(b.subarray(0,magic.length).toString(),magic)}r=await fetch(base+'/api/resume/exe');assert.equal(r.status,400)}finally{server.close()}});
test('Disconnected database never reports a successful submission',async()=>{let server=createApp({isReady:()=>false}).listen(0);await new Promise(r=>server.on('listening',r));try{let r=await fetch(`http://127.0.0.1:${server.address().port}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test User',email:'test@example.com',message:'A valid unsaved message.'})});assert.equal(r.status,503)}finally{server.close()}});

test('Contact submissions cannot be listed publicly and empty requests are rejected', async () => {
  const server = createApp({ isReady: () => true }).listen(0);
  await new Promise(resolve => server.on('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(base + '/api/contact', { method });
      assert.equal(response.status, 404);
    }
    const response = await fetch(base + '/api/contact', { method: 'POST' });
    assert.equal(response.status, 400);
  } finally {
    server.close();
  }
});
