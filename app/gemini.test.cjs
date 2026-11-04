const {test}=require('node:test');const assert=require('node:assert/strict');
const {createConversation}=require('./gemini.cjs');
test('Gemini keeps successful context and sends authentication in header',async()=>{
 const calls=[];const reply=createConversation({env:{GEMINI_API_KEY:'test-key'},fetchImpl:async(url,options)=>{calls.push({url,...options});return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'Hello, sir.'}]}}]})};}});
 assert.equal(await reply('hello'),'Hello, sir.');await reply('remember me?');
 assert.equal(calls[0].headers['x-goog-api-key'],'test-key');assert.ok(!calls[0].url.includes('test-key'));assert.equal(JSON.parse(calls[1].body).contents.length,3);
});
test('Missing keys and rejected requests do not create successful history',async()=>{
 await assert.rejects(createConversation({env:{}})('hello'),/GEMINI_API_KEY/);
 let fails=true;let contents;const reply=createConversation({env:{GEMINI_API_KEY:'test'},fetchImpl:async(_url,options)=>{contents=JSON.parse(options.body).contents;return fails?{ok:false,status:429}:{ok:true,json:async()=>({candidates:[{content:{parts:[{text:'OK'}]}}]})};}});
 await assert.rejects(reply('failed'),/quota/);fails=false;await reply('retry');assert.equal(contents.length,1);
});
test('No answer and blocked answers are reported; speech stays within its size limit',async()=>{
 for(const data of [{},{promptFeedback:{blockReason:'SAFETY'}}])await assert.rejects(createConversation({env:{GEMINI_API_KEY:'test'},fetchImpl:async()=>({ok:true,json:async()=>data})})('hi'));
 const reply=createConversation({env:{GEMINI_API_KEY:'test'},fetchImpl:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'x'.repeat(3000)}]}}]})})});assert.equal((await reply('hi')).length,1900);
});
