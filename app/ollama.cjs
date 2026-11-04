function cleanAnswer(content) {
 if(typeof content!=='string')return '';
 let answer=content.replace(/<think\b[^>]*>[\s\S]*?<\/think\s*>/gi,'');
 // Some models omit the opening tag but still emit the closing delimiter.
 const close=/<\/think\s*>/i.exec(answer);
 if(close)answer=answer.slice(close.index+close[0].length);
 answer=answer.replace(/<think\b[^>]*>[\s\S]*$/gi,'');
 return answer.trim();
}
function createConversation({fetchImpl=globalThis.fetch,env=process.env}={}) {
 let history=[];
 return async function reply(text) {
  const model=env.OLLAMA_MODEL||'qwen3:4b';
  let response;
  try {
   response=await fetchImpl('http://127.0.0.1:11434/api/chat',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model,stream:false,think:false,messages:[{role:'system',content:'You are JARVIS, a composed and witty personal assistant. Respond helpfully in plain text, usually under 150 words. You cannot browse or execute actions through chat. Never claim to perform actions. The app separately handles commands such as open example.com, search for a topic, and set a timer for 5 minutes.'},...history,{role:'user',content:text}],options:{num_predict:512,num_ctx:4096}}),
    signal:AbortSignal.timeout(180000)
   });
  } catch(error) {
   if(error.name==='TimeoutError'||error.name==='AbortError')throw Error('Ollama took too long. Try again after the model loads, or use a smaller OLLAMA_MODEL.');
   throw Error('Cannot reach Ollama. Open the Ollama app on your Mac, then try again.');
  }
  if(!response.ok){if(response.status===404)throw Error(`Ollama model not found. Run: ollama pull ${model}`);throw Error(`Ollama returned HTTP ${response.status}. Check that the model can run on your Mac.`);}
  const data=await response.json();
  const answer=cleanAnswer(data.message?.content);
  if(!answer)throw Error('Ollama returned no answer. Try again or select another model.');
  const bounded=answer.length>1900?answer.slice(0,1899)+'…':answer;
  history=[...history,{role:'user',content:text},{role:'assistant',content:bounded}].slice(-12);
  return bounded;
 };
}
module.exports={createConversation,cleanAnswer};
