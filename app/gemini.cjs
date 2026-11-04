function createConversation({fetchImpl=globalThis.fetch,env=process.env}={}) {
 let history=[];
 return async function reply(text) {
  const key=env.GEMINI_API_KEY?.trim();
  if(!key) throw Error('Set GEMINI_API_KEY before launching JARVIS to enable conversation.');
  const model=env.GEMINI_MODEL||'gemini-2.5-flash';
  if(!/^[a-zA-Z0-9._-]+$/.test(model)) throw Error('Invalid GEMINI_MODEL.');
  const user={role:'user',parts:[{text}]};
  let response;
  try {
   response=await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body:JSON.stringify({systemInstruction:{parts:[{text:'You are JARVIS, a composed, witty personal assistant. Give helpful, accurate, concise conversational answers in plain text, usually under 150 words. You may call the user sir occasionally. You cannot browse or perform device actions through this conversation. Never claim to have performed actions. The app separately supports explicit commands: open example.com, search for a topic, and set a timer for 5 minutes. Explain these commands when needed.'}]},contents:[...history,user],generationConfig:{maxOutputTokens:1200}}),
    signal:AbortSignal.timeout(45000)
   });
  } catch {throw Error('Could not reach Gemini. Check your internet connection and try again.');}
  if(!response.ok){const messages={400:'Gemini rejected the request. Check API key and model configuration.',401:'Gemini authentication failed. Check GEMINI_API_KEY.',403:'Gemini access denied. Check your API key, project permissions, and region.',404:'Gemini model unavailable. Set GEMINI_MODEL to a model enabled for your account.',429:'Gemini quota or rate limit reached. Check your plan or try again later.'};throw Error(messages[response.status]||`Gemini returned HTTP ${response.status}. Try again later.`);}
  const data=await response.json();
  const candidate=data.candidates?.[0];
  if(data.promptFeedback?.blockReason||candidate?.finishReason==='SAFETY')throw Error('Gemini could not answer this message. Try rephrasing it.');
  const answer=candidate?.content?.parts?.filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join('\n').trim();
  if(!answer)throw Error('Gemini returned no answer. Try rephrasing your message.');
  const bounded=answer.length>1900?answer.slice(0,1899)+'…':answer;
  history=[...history,user,{role:'model',parts:[{text:bounded}]}].slice(-20);
  return bounded;
 };
}
module.exports={createConversation};
