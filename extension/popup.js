window.onload = function() {

    console.log("load");

    document.getElementById("enablefriendlist").onclick = function() {
        chrome.runtime.sendMessage({friendlist: "refresh"});
        chrome.permissions.contains({
            permissions: ['notifications'],
        }, function(result) {
            if (result) {
                if(document.getElementById("enablefriendlist").checked) {
                    console.log("checked");
                    localStorage.setItem("iOfriendlistenabled",1);chrome.storage.sync.set({iOfriendsenabled : "1"},function(){chrome.runtime.sendMessage({friendlist: "refresh"});location.reload();});}
                else {
                    localStorage.setItem("iOfriendlistenabled",0);chrome.storage.sync.set({iOfriendsenabled : "0"},function(){chrome.runtime.sendMessage({friendlist: "refresh"});location.reload();});}
            } else { // If there's no permission
                chrome.permissions.request({
                    permissions: ['notifications'],
                }, function(granted) {localStorage.setItem("iOfriendlistenabled",1);chrome.runtime.sendMessage({friendlist: "1"},function(){chrome.runtime.sendMessage({friendlist: "refresh"});location.reload();});});
            }
        }
                                   );
    };

    if(localStorage.getItem("iOfriendlistenabled")==1) {
        document.getElementById("enablefriendlist").checked = true;}
    else{return;}

    function getStatuses(){
        document.getElementById("onlinefriends").innerHTML = "";

        chrome.runtime.sendMessage({getfriendsbystatus: "Online"}, function (response){
            console.log(response);
            for (i = 0; i < response.thelist.length-1; i++) {
                if(response.thelist[i] !== ""){
                    if(document.getElementById("onlinefriends").innerHTML === ""){document.getElementById("onlinefriends").innerHTML = '<img id="iostatusimage" src="online.svg" height="12" width="12"> <b><span id="iOstatustext" style="color:green">Online</span></b>';}
                    document.getElementById("onlinefriends").innerHTML += "<br><a href='https://scratch.mit.edu/users/"+response.thelist[i]+"/' target='_blank'>"+response.thelist[i]+"</a>";}}
        });

        chrome.runtime.sendMessage({getfriendsbystatus: "Away"}, function (response){
            document.getElementById("awayfriends").innerHTML = "";
            console.log(response);
            for (i = 0; i < response.thelist.length-1; i++) {
                if(response.thelist[i] !== ""){
                    if(document.getElementById("awayfriends").innerHTML === ""){document.getElementById("awayfriends").innerHTML = '<br><img id="iostatusimage" src="absent.svg" height="12" width="12"> <b><span id="iOstatustext" style="color:orange">Away</span></b>';}
                    document.getElementById("awayfriends").innerHTML += "<br><a href='https://scratch.mit.edu/users/"+response.thelist[i]+"/' target='_blank'>"+response.thelist[i]+"</a>";}}
        });

        chrome.runtime.sendMessage({getfriendsbystatus: "Offline"}, function (response){
            document.getElementById("offlinefriends").innerHTML = "";
            console.log(response);
            for (i = 0; i < response.thelist.length-1; i++) {
                if(response.thelist[i] !== ""){
                    if(document.getElementById("offlinefriends").innerHTML === ""){document.getElementById("offlinefriends").innerHTML = '<br><img id="iostatusimage" src="offline.svg" height="12" width="12"> <b><span id="iOstatustext" style="color:red">Offline</span></b>';}
                    document.getElementById("offlinefriends").innerHTML += "<br><a href='https://scratch.mit.edu/users/"+response.thelist[i]+"/' target='_blank'>"+response.thelist[i]+"</a>";}}
        });

        chrome.runtime.sendMessage({getfriendsbystatus: "Unknown"}, function (response){
            document.getElementById("unknownfriends").innerHTML = "";
            console.log(response);
            for (i = 0; i < response.thelist.length-1; i++) {
                if(response.thelist[i] !== ""){
                    if(document.getElementById("unknownfriends").innerHTML === ""){document.getElementById("unknownfriends").innerHTML = '<br><b><span id="iOstatustext" style="color:grey">Loading statuses from...</span></b>';}
                    document.getElementById("unknownfriends").innerHTML += "<br><a href='https://scratch.mit.edu/users/"+response.thelist[i]+"/' target='_blank'>"+response.thelist[i]+"</a>";}}
        });
    }

	onlineList();setInterval(onlineList, 5000);

function onlineList() {
    chrome.tabs.query({url:"https://scratch.mit.edu/*"}, function(tabs) {
        if (tabs.length!==0){getStatuses();}
        else {document.getElementById("onlinefriends").innerHTML="Friend list only works when you have at least one Scratch tab open";}
    });
}
};