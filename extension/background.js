chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({url:"https://scratchtools.tk/isonline/register/"});}
    if(details.reason == "update"){
        //chrome.tabs.create({url: "https://scratch.mit.edu/isonline-extension/update"});
		}
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "reload") {
            location.reload();}
		if (request.setuninstallurl != null) {
		chrome.runtime.setUninstallURL("https://scratchtools.tk/isonline/uninstall/?user="+request.setuninstallurl.name+"&key="+request.setuninstallurl.key);}
		
		if(request.color){
			console.log(request.color);
			chrome.browserAction.setBadgeBackgroundColor({color: request.color});
		}
    });
	
setInterval(function(){
    chrome.tabs.query({url:"https://scratch.mit.edu/*"}, function(tabs) {
        if (tabs.length===0){chrome.browserAction.setBadgeText({text: ""});}
    });
}, 10000);
