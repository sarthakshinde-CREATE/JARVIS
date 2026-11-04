function parseCommand(text) {
 const alarm = text.match(/^(?:set (?:an? )?)?(?:alarm|timer)(?: for| in)? (\d+) (seconds?|minutes?|hours?)$/i);
 if (alarm) { const seconds = Number(alarm[1]) * (/hour/i.test(alarm[2]) ? 3600 : /minute/i.test(alarm[2]) ? 60 : 1); if (seconds > 0 && seconds <= 604800) return {type:'alarm',seconds}; }
 const search = text.match(/^(?:search|google)(?: for)? (.+)$/i);
 if (search) return {type:'browser',url:'https://www.google.com/search?q='+encodeURIComponent(search[1])};
 const open = text.match(/^open (.+)$/i);
 if (open) { try { const url = new URL(/^https?:\/\//i.test(open[1]) ? open[1] : 'https://'+open[1]); if (['http:','https:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password) return {type:'browser',url:url.href}; } catch {} }
 return {type:'unknown'};
}
module.exports={parseCommand};
