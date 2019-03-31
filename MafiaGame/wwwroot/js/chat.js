"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage",
    function(user, message) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = user + " says " + msg;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
    });
connection.on("ReceiveMessageGroup",
    function(user, groupName, message) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = user + " from " + groupName + " says " + msg;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
    });
connection.on("ReceiveErr", (errMessage) => { console.log(errMessage); });

connection.on("GameReady",
    () => {
        var cont = document.getElementById("ceva");
        var el = document.createElement("button");
        el.innerHTML = "Ready?";
        var user = document.getElementById("userInput").value;
        var group = document.getElementById("groupInput").value;
        var time = setTimeout(() => {
                var user = document.getElementById("userInput").value;
                var gameName = document.getElementById("groupInput").value;
                connection.invoke("LeaveGame", user, gameName).catch(function(err) {
                    return console.error(err.toString());
                });
                el.parentNode.removeChild(el);

            },
            10000);
        el.onclick = () => {
            connection.invoke("PlayerReady",user,group);
            el.parentNode.removeChild(el);
            clearTimeout(time);
        };
        cont.appendChild(el);
    });

connection.on("ReceiveGames",
    function(list) {
        console.log(list);
        var groups = document.getElementById("groupsList");
        while (groups.firstChild)
            groups.removeChild(groups.firstChild);
        list.forEach(function(elem) {
            var li = document.createElement("li");
            li.textContent = elem.roomName;
            groups.appendChild(li);
            var ul2 = document.createElement("ul");
            groups.appendChild(ul2);
            elem.players.forEach(function(player) {
                var li2 = document.createElement("li");
                li2.textContent = "Name: " + player.name + " Role:" + player.role;
                ul2.appendChild(li2);
            });
        });
    });
connection.start().then(function() {
    document.getElementById("sendButton").disabled = false;
    connection.invoke("UserRequestList");
}).catch(function(err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click",
    function(event) {
        var user = document.getElementById("userInput").value;
        var message = document.getElementById("messageInput").value;
        connection.invoke("SendMessage", user, message).catch(function(err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
document.getElementById("sendToGroupButton").addEventListener("click",
    function(event) {
        var user = document.getElementById("userInput").value;
        var message = document.getElementById("messageInput").value;
        var group = document.getElementById("groupInput").value;
        connection.invoke("SendMessageGroup", user, group, message).catch(function(err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
document.getElementById("sendToAssassinsGroupButton").addEventListener("click",
    function(event) {
        var user = document.getElementById("userInput").value;
        var message = document.getElementById("messageInput").value;
        var group = document.getElementById("groupInput").value;
        connection.invoke("SendMessageToAssassinsGroup", user, group, message).catch(function(err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
document.getElementById("groupButton").addEventListener("click",
    function(event) {
        var user = document.getElementById("userInput").value;
        var gameName = document.getElementById("groupInput").value;
        connection.invoke("CreateGame", user, gameName).catch(function(err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
document.getElementById("joinGroupButton").addEventListener("click",
    function(event) {
        var user = document.getElementById("userInput").value;
        var gameName = document.getElementById("groupInput").value;
        connection.invoke("JoinGame", user, gameName).catch(function(err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
document.getElementById("leaveGroupButton").addEventListener("click",
    function(event) {
        var user = document.getElementById("userInput").value;
        var gameName = document.getElementById("groupInput").value;
        connection.invoke("LeaveGame", user, gameName).catch(function(err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });