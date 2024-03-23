export const time = ()=>(Date.now() / 1000) | 0;

export const sleep = (ms)=>new Promise((r)=>setTimeout(r, ms));
