chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({url:"https://scratchtools.tk/isonline/register/"});}
    if(details.reason == "update"){
        chrome.tabs.create({url: "https://scratch.mit.edu/isonline-extension/update"});
		}
});

let key, user;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "reload") {
            location.reload();}
		if (request.setuninstallurl != null) {
		chrome.runtime.setUninstallURL("https://scratchtools.tk/isonline/uninstall/?user="+request.setuninstallurl.name+"&key="+request.setuninstallurl.key);}
		
		if(request.color === ""){
		localStorage.setItem("iOstatus","online");
		chrome.browserAction.getBadgeText({}, function(result) {
		if(result===" "){chrome.browserAction.setBadgeText({text: ""});}
		chrome.browserAction.setBadgeBackgroundColor({color: "#0000FF"});
		});
		}
        if (request.color == "orange") {
		localStorage.setItem("iOstatus","absent");
            badge("#FFA500");}
        if (request.color == "gray") {
		localStorage.setItem("iOstatus","dnd");
            badge("#808080");}
		if (request.color == "red") {
		localStorage.setItem("iOstatus","offline");
            badge("#FF0000");}
		
		if(request.keyinfo){
			key = request.keyinfo.key;
			user = request.keyinfo.localuser;
		}
    });
	
setInterval(function(){
    chrome.tabs.query({url:"https://scratch.mit.edu/*"}, function(tabs) {
        if (tabs.length===0){chrome.browserAction.setBadgeText({text: ""});}
    });
}, 10000);


function badge(thecolor) {
	chrome.browserAction.getBadgeText({}, function(result) {
	if(result===""){
    chrome.browserAction.setBadgeText({text: " "});}
	chrome.browserAction.setBadgeBackgroundColor({color: thecolor});
});
}

chrome.contextMenus.removeAll(() => {
	chrome.contextMenus.create({
		title: "Load status of this user",
		contexts: ["link"],
		targetUrlPatterns: ["*://scratch.mit.edu/users/*"],
		onclick: function(info, tab){
			let username = info.linkUrl.replace(/.+\/users\//, "").replace(/[^a-zA-Z0-9_-].*/, "");
			let internet = new XMLHttpRequest();
			internet.open("GET", "https://scratchtools.tk/isonline/api/v1/" + user + "/" + key + "/get/" + username + "/");
			internet.onreadystatechange = function(){
				if(internet.readyState === 4){
					if(internet.status === 200) {
						let result = JSON.parse(internet.responseText);
						switch(result.status){
							case "online":
								if(new Date().valueOf() / 1000 - result.timestamp < 300){
									chrome.tabs.sendMessage(tab.id, {
										ctxmenu: true,
										url: info.linkUrl,
										content: "<img src='https://scratchtools.tk/isonline/assets/online.svg' height='12' width='12'/>"
									});									
								} else {
									chrome.tabs.sendMessage(tab.id, {
										ctxmenu: true,
										url: info.linkUrl,
										content: "<img src='https://scratchtools.tk/isonline/assets/offline.svg' height='12' width='12'/>"
									});
								}
								break;
							case "absent":
								if(new Date().valueOf() / 1000 - result.timestamp < 180){
									chrome.tabs.sendMessage(tab.id, {
										ctxmenu: true,
										url: info.linkUrl,
										content: "<img src='https://scratchtools.tk/isonline/assets/absent.svg' height='12' width='12'/>"
									});									
								} else {
									chrome.tabs.sendMessage(tab.id, {
										ctxmenu: true,
										url: info.linkUrl,
										content: "<img src='https://scratchtools.tk/isonline/assets/offline.svg' height='12' width='12''/>"
									});
								}
								break;
							case "dnd":
								if(new Date().valueOf() / 1000 - result.timestamp < 180){
									chrome.tabs.sendMessage(tab.id, {
										ctxmenu: true,
										url: info.linkUrl,
										content: "<img src='https://scratchtools.tk/isonline/assets/dnd.svg' height='12' width='12'/>"
									});									
								} else {
									chrome.tabs.sendMessage(tab.id, {
										ctxmenu: true,
										url: info.linkUrl,
										content: "<img src='https://scratchtools.tk/isonline/assets/offline.svg' height='12' width='12'/>"
									});
								}
								break;

						}
					} else if (internet.status === 404) {
						if(internet.responseText){
							try {
								chrome.tabs.sendMessage(tab.id, {
									ctxmenu: true,
									url: info.linkUrl,
									content: "<span style='color: red;'>[ Not iO User ]</span>"
								});	
							} catch (e) {
								chrome.tabs.sendMessage(tab.id, {
									ctxmenu: true,
									url: info.linkUrl,
									content: "<span style='color: red;'>[ Error ]</span>"
								});									
							}
						}
					} else {
						chrome.tabs.sendMessage(tab.id, {
							ctxmenu: true,
							url: info.linkUrl,
							content: "<span style='color: red;'>[ Error ]</span>"
						});	
					}
				}
			};
			chrome.tabs.sendMessage(tab.id, {ctxmenu: true, url: info.linkUrl});
			internet.send();
		}
	})
})
