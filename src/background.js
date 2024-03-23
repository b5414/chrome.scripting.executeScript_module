import {sleep, time} from './basic.js';

//
//
// (Ctrl + F) => any: [main_goal, without]

const injectFunc = async(args)=>{
	try{
		const funcs = await import(await chrome.runtime.getURL('./basic.js'));
		console.log('[injectFunc] funcs:', funcs);

		window.time = funcs.time;

		return {text: 'injected', time: 'time: ' + funcs.time()};
	}catch(e){
		return {err: e.message, args};
	}
};

const mainFunc = async(/* @main_goal: funcs, */ args)=>{
	try{
		console.log('[mainFunc] args:', args);

		// @main_goal: get/recieve_access time here

		// and @without:
		// const funcs = await import(args.fileWithPath);

		// const ms = funcs.time();
		const ms = window.time();

		return {text: 'Wow, time is: ' + ms};
	}catch(e){
		return {err: e.message, args};
	}
};

const createWin = async()=>{
	const win = await chrome.windows.create({
		focused: false,

		url: 'https://www.google.com/',
		type: 'popup',

		top: 0,
		left: 0,
		width: 1000,
		height: 600,
	});

	await sleep(2000);

	const tab = win.tabs[0];
	const winId = win.id;
	const tabId = tab.id;

	//

	await chrome.scripting.executeScript({
		injectImmediately: true,
		world: 'ISOLATED',
		target: {tabId},
		func: injectFunc,
	}).then((r)=>console.log(1, r?.[0]?.result));

	//

	await chrome.scripting.executeScript({
		injectImmediately: true,
		world: 'MAIN',
		target: {tabId},
		func: mainFunc,
		// @main_goal
		/* funcs: [sleep, time], */
		args: [
			{
				sleep,
				time,
				// @without
				fileWithPath: await chrome.runtime.getURL('./basic.js'),
			},
		],
	}).then((r)=>console.log(2, r?.[0]?.result));

	//

	await Promise.all([chrome.tabs.remove(tabId), chrome.windows.remove(winId)]).catch((e)=>{});
};

chrome.action.onClicked.addListener(()=>createWin());
