using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MafiaGame.Game
{
    public class ChatHub : Hub
    {
        public static GameHub GameHub = new GameHub();

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendMessageGroup(string user, string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessageGroup", user, groupName, message);
        }

        public async Task SendMessageToAssassinsGroup(string user, string groupName, string message)
        {
            try
            {
                if (GameHub.PlayerIsAssassin(user, groupName))
                    await Clients.Group(groupName + "Assassins")
                        .SendAsync("ReceiveMessageGroup", "Assassin " + user, groupName, message);
                else await Clients.Caller.SendAsync("ReceiveErr", "You are not an assassin");
            }
            catch (Exception ae)
            {
                var client = Clients.Caller;
                await SendError(client, "SendMessageToAssassinsGroup: " + ae.Message);
            }
        }

        public async Task CreateGame(string user, string gameName)
        {
            try
            {
                GameHub.CreateNewGame(user, gameName, Context.ConnectionId);
                if (GameHub.PlayerIsAssassin(user, gameName))
                    await JoinChatRoom(gameName + "Assassins");
                await JoinChatRoom(gameName);
                var game = GameHub.GetGame(gameName);
                await Clients.Group(gameName).SendAsync("IJoinedGame", game);
                await SendListToAll();
            }
            catch (Exception ae)
            {
                var client = Clients.Caller;
                await SendError(client, "CreateGame: " + ae.Message);
            }
        }

        public async Task JoinGame(string user, string gameName)
        {
            try
            {
                GameHub.AddPlayerToGame(user, gameName, Context.ConnectionId);
                if (GameHub.PlayerIsAssassin(user, gameName))
                    await JoinChatRoom(gameName + "Assassins");
                await JoinChatRoom(gameName);
                await Clients.Group(gameName).SendAsync("IJoinedGame", GameHub.GetGame(gameName));
                await SendListToAll();
                if (GameHub.GamesList.Find(x => x.Name.Equals(gameName)).PlayersLimit == 0)
                {
                    await Clients.Group(gameName).SendAsync("GameReady");
                }
            }
            catch (ArgumentException ae)
            {
                var client = Clients.Caller;
                await SendError(client, "JoinGame: " + ae.Message);
            }
            catch (Exception e)
            {
                var client = Clients.Caller;
                await SendError(client, "JoinGame: " + e.Message);
            }
        }

        public async Task LeaveGame(string user, string gameName)
        {
            try
            {
                if (GameHub.PlayerIsAssassin(user, gameName))
                    await LeaveChatRoom(gameName + "Assassins");
                GameHub.RemovePlayerFromGame(user, gameName);
                await LeaveChatRoom(gameName);
                var game = GameHub.GetGame(gameName);
                if (game.Players.Count == 0)
                {
                    GameHub.GamesList.Remove(game);
                }
                else
                {
                    await Clients.Group(gameName).SendAsync("IJoinedGame", GameHub.GetGame(gameName));
                    foreach (var player in game.Players)
                    {
                        player.Ready = false;
                    }
                }

                await SendListToAll();
            }
            catch (ArgumentException ae)
            {
                var client = Clients.Caller;
                await SendError(client, "LeaveGame: " + ae.Message);
            }
            catch (Exception e)
            {
                var client = Clients.Caller;
                await SendError(client, "LeaveGame: " + e.Message);
            }
        }

        public async Task PlayerReady(string user, string groupName)
        {
            GameHub.GamesList.Find(x => x.Name == groupName).Players.Find(x => x.Name == user).Ready = true;
            var ok = true;
            foreach (var i in GameHub.GamesList.Find(x => x.Name == groupName).Players)
            {
                if (i.Ready) continue;
                ok = false;
                break;
            }

            if (ok)
            {
                await StartGame(groupName);
            }
        }

        public async Task StartGame(string groupName)
        {
            await Clients.Group(groupName).SendAsync("StartGame");
            var assassins = new List<Player>();
            var targets = new List<Player>();
            foreach (var player in GameHub.GetGame(groupName).Players)
            {
                if (player.GetRole() == Type.Assassin)
                    assassins.Add(player);
                else
                    targets.Add(player);
                if (player.GetRole() == Type.Cop)
                    await Clients.Client(player.ConnectionId).SendAsync("YouAreCop");

            }

            await SendTargetsToAssassins(assassins, groupName);
        }

        public async Task SendListToAll()
        {
            await Clients.All.SendAsync("ReceiveGames", GameHub.GamesList);
        }

        public async Task SendError(IClientProxy client, string errMessage)
        {
            await client.SendAsync("ReceiveErr", errMessage);
        }

        public async Task UserRequestsList()
        {
            await Clients.Caller.SendAsync("ReceiveGames", GameHub.GamesList);
        }

        public async Task JoinChatRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        }

        public async Task LeaveChatRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        }

        public async Task SendTargetsToAssassins(List<Player> targets, string groupName)
        {
            await Clients.Group(groupName + "Assassins").SendAsync("GetTargets", targets);
        }

        public async Task KillTarget(string killer, string target, string groupName)
        {
            if (GameHub.GetGame(groupName).Night && GameHub.GetGame(groupName).PlayerIsAssassin(killer) ||
                !GameHub.GetGame(groupName).Night && !GameHub.GetGame(groupName).PlayerIsCop(killer))
            {
                GameHub.GetGame(groupName).KillPlayer(target);
                await Clients.Group(groupName).SendAsync("GetPlayers", GameHub.GetGame(groupName).Players);
                if (!GameHub.GetGame(groupName).AssassinAlive)
                    await CopWins(groupName);
                else if (!GameHub.GetGame(groupName).CopAlive)
                {
                    await AssassinsWin(groupName);
                }
                else
                {
                    await DayChanged(groupName);
                }
            }
            else
            {
                await Clients.Caller.SendAsync("ReceiveErr", "Is not your turn");
            }
        }

        public async Task AssassinsWin(string groupName)
        {
            await Clients.Group(groupName).SendAsync("AssassinsWin");
        }

        public async Task CopWins(string groupName)
        {
            await Clients.Group(groupName).SendAsync("CopWins");
        }

        public async Task DayChanged(string groupName)
        {
            await Clients.Group(groupName).SendAsync("DayChanged", GameHub.GetGame(groupName));
        }
    }
}