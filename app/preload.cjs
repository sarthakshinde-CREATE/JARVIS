const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('jarvis',{command:text=>ipcRenderer.invoke('command',text),speak:text=>ipcRenderer.invoke('speak',text),onAlarm:callback=>ipcRenderer.on('alarm',(_event,label)=>callback(label))});
