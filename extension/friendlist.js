var audio = new Audio('sound.mp3');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.friendlist == "refresh") {
            location.reload();}
        if (request.getfriendsbystatus !== undefined) {
            list = [friendlist[0]===undefined||friendliststatuses[0]!==request.getfriendsbystatus ? "" : friendlist[0],friendlist[1]===undefined||friendliststatuses[1]!==request.getfriendsbystatus ? "" : friendlist[1],friendlist[2]===undefined||friendliststatuses[2]!==request.getfriendsbystatus ? "" : friendlist[2],friendlist[3]===undefined||friendliststatuses[3]!==request.getfriendsbystatus ? "" : friendlist[3],friendlist[4]===undefined||friendliststatuses[4]!==request.getfriendsbystatus ? "" : friendlist[4],friendlist[5]===undefined||friendliststatuses[5]!==request.getfriendsbystatus ? "" : friendlist[5],friendlist[6]===undefined||friendliststatuses[6]!==request.getfriendsbystatus ? "" : friendlist[6],friendlist[7]===undefined||friendliststatuses[7]!==request.getfriendsbystatus ? "" : friendlist[7],friendlist[8]===undefined||friendliststatuses[8]!==request.getfriendsbystatus ? "" : friendlist[8],friendlist[9]===undefined||friendliststatuses[9]!==request.getfriendsbystatus ? "" : friendlist[9]].filter(Boolean);
			sendResponse({thelist: list});
        }
        if (request.addfriend !== undefined) {
            if(friendlist.length==10){sendResponse({result: "ok"});anynotification("Could not add "+request.addfriend+" to friend list","Reason: reached amount of friends (10). You can remove friends by clicking on the extension icon.");} 
			else {
                sendResponse({result: "ok"});
                friendlist.push(request.addfriend);
                chrome.storage.sync.set({iOfriendlist : friendlist}, function(){anynotification("Added "+request.addfriend+" to friend list","You'll now receive notifications when they get online.");location.reload();});}
        }
        if (request.removefriend !== undefined) {
            sendResponse({result: "ok"});
            friendlist.splice(friendlist.indexOf(request.removefriend), 1);
            chrome.storage.sync.set({iOfriendlist : friendlist}, function(){anynotification("Removed "+request.removefriend+" of friend list","You won't receive notifications when they get online anymore.");location.reload();});
        }
    });


chrome.permissions.contains({
    permissions: ['notifications'],
}, function(result) {
    if (result && localStorage.getItem("iOfriendlistenabled")==1) {
        chrome.storage.sync.get(["iOaccounts", "iOfriendlist"], function (data) {
            registeredUsers = JSON.stringify(data.iOaccounts) === "{}" ? [] : JSON.parse(data.iOaccounts);
            friendlist = data.iOfriendlist===undefined ? [] : data.iOfriendlist;
            for (i = 0; i < registeredUsers.length; i++) {
                if(registeredUsers[i].key !== "changed"){localuser = registeredUsers[i].name;key = registeredUsers[i].key;console.log("huh");friendlistcode();}
            }
        });
    }
});

function friendlistcode() {

    if (JSON.stringify(friendlist)==="[]"){return;}
    friendliststatuses=[0,0,0,0,0,0,0,0,0,0].map(() => "Unknown");
    time = function(){return Math.floor(Date.now() / 1000);};

    x = 0;
    max = friendlist.length-1;
	interval = 1000;
	docheck();
	
    firstinterval = setInterval(function(){
        if(x>max){x=0;}
        chrome.tabs.query({url:"https://scratch.mit.edu/*"}, function(tabs) {
			scratchopen = tabs.length>0;
            if(scratchopen===false){friendliststatuses=[0,0,0,0,0,0,0,0,0,0].map(() => "Unknown");chrome.browserAction.setBadgeText({text: ""});}
        });
    }, 3000);

}

function docheck(){
	if(x>max){console.log("x>max");x=0;interval=60000/(max+1);}
	check(x);
}
	




function check(i) {
    x++;
    console.log("Checking #"+(i+1)+": @"+friendlist[i]);
    getstatus = new XMLHttpRequest();getstatus.open("GET", ' https://scratchtools.tk/isonline/api/v1/' + localuser + '/' + key + "/get/" + friendlist[i], true);getstatus.send();
    getstatus.onreadystatechange = function() {
        if (getstatus.readyState === 4) {
            console.log("Status: "+getstatus.status);
            if (getstatus.status === 200) {

                response  = getstatus.responseText;
                timestamp = JSON.parse(response).timestamp;
                var status = JSON.parse(response).status;

                if (status == "online") {
                    if (time() - timestamp < 300) {
                        if(friendliststatuses[i]=="Offline") {notification(friendlist[i]);}
                        friendliststatuses[i] = "Online";
                    } else{
                        friendliststatuses[i] = "Offline";}}

                if (status == "absent") {
                    if (time() - timestamp < 180) {
                        if(friendliststatuses[i]=="Offline") {notification(friendlist[i]);}
                        friendliststatuses[i] = "Away";}
                    else{
                        friendliststatuses[i] = "Offline";}}

                if (status == "dnd") {
                    friendliststatuses[i] = "Offline";}

                console.log("is"+friendliststatuses.toString().match(/Online/g) === null);

                if (friendliststatuses.toString().match(/Online/g) === null) {
                    console.log("smaller");
                    chrome.browserAction.setBadgeText({text: ""});}
                else {
                    console.log("bigger");
                    chrome.browserAction.setBadgeText({text: String(friendliststatuses.toString().match(/Online/g).length)});}


            }
            if (getstatus.status === 404) {
                console.log("404");
                friendlist.splice(friendlist.indexOf(friendlist[i]), 1);
                chrome.storage.sync.set({iOfriendlist : friendlist}, function(){location.reload();});
            }
		setTimeout(docheck, interval);}
		};

}

function notification(user) {
    audio.play();
    var notification = new Notification(user+' is now online', {
        icon: "icon.png",
        body: "Click to go to profile",
    });
    notification.onclick = function(){notification.close();window.open("https://scratch.mit.edu/users/"+user+"/");};
    setTimeout(function () {
        notification.close();
    }, 10000);
}

function anynotification(title,body) {
    audio.play();
    var notification = new Notification(title, {
        icon: "icon.png",
        body: body,
    });
}
