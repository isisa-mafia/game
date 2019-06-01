using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MafiaGame.Game
{
    public class ChatHub : Hub
    {
        private static readonly GameHub GameHub = new GameHub();

        /// <summary>
        /// Sends a message to all connected clients
        /// </summary>
        /// <param name="user">Sender's name</param>
        /// <param name="message">Message to be send</param>
        /// <returns></returns>
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        /// <summary>
        /// Sends a message to all clients in a group
        /// </summary>
        /// <param name="user">Sender's name</param>
        /// <param name="groupName">The name of the group which is to receive the message</param>
        /// <param name="message">Message to be send</param>
        /// <returns></returns>
        public async Task SendMessageGroup(string user, string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessageGroup", user, groupName, message);
        }

        /// <summary>
        /// Creates a new game and puts the creator in it as the first player.
        /// Announces the creator that he joined the game.
        /// Announces all the connected players about the new game.
        /// </summary>
        /// <param name="user">The name of the player</param>
        /// <param name="gameName">The name of the game which is to be created</param>
        /// <returns></returns>
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

        /// <summary>
        /// Method called by the client when he wants to join a game.
        /// If the new number of players in the game is 0, initializes a ready check to the players.
        /// Announces all the clients about the change.
        /// </summary>
        /// <param name="user">The name of the player</param>
        /// <param name="gameName">The name of the game</param>
        /// <returns></returns>
        public async Task JoinGame(string user, string gameName)
        {
            try
            {
                GameHub.AddPlayerToGame(user, gameName, Context.ConnectionId);
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

        /// <summary>
        /// Method called by the client when he wants to leave a game.
        /// If the remaining number of players in the game is 0, closes the game.
        /// Announces all the clients about the change.
        /// </summary>
        /// <param name="user">The name of the player who is to leave</param>
        /// <param name="gameName">The name of the game</param>
        /// <returns></returns>
        public async Task LeaveGame(string user, string gameName)
        {
            try
            {
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

        /// <summary>
        /// Method called by a client when he is ready for the game to start
        /// If all the players are ready, starts the game and announces the players about their roles
        /// </summary>
        /// <param name="user">The name of the caller</param>
        /// <param name="groupName">The name of the caller's group</param>
        /// <returns></returns>
        public async Task PlayerIsReady(string user, string groupName)
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
                await Clients.Group(groupName).SendAsync("StartGame");
                foreach (var player in GameHub.GetGame(groupName).Players)
                {
                    if (player.GetRole() == Type.Assassin)
                        await TellPlayerHeIsAssassin(player);
                    else if (player.GetRole() == Type.Cop)
                        await TellPlayerHeIsCop(player);
                }
            }
        }

        /// <summary>
        /// Tells the player he is an assassin
        /// </summary>
        /// <param name="player">The player which is to be announced</param>
        /// <returns></returns>
        public async Task TellPlayerHeIsAssassin(Player player)
        {
            await Clients.Client(player.ConnectionId).SendAsync("YouAreAssassin");
        }

        /// <summary>
        /// Tells the player he is a cop
        /// </summary>
        /// <param name="player">The player which is to be announced</param>
        /// <returns></returns>
        public async Task TellPlayerHeIsCop(Player player)
        {
            await Clients.Client(player.ConnectionId).SendAsync("YouAreCop");
        }

        /// <summary>
        /// Sends the games list to all connected clients
        /// </summary>
        /// <returns></returns>
        public async Task SendListToAll()
        {
            await Clients.All.SendAsync("ReceiveGames", GameHub.GamesList);
        }

        /// <summary>
        /// Sends an error message to a client
        /// </summary>
        /// <param name="client">The client which is to receive the error message</param>
        /// <param name="errMessage">The error message</param>
        /// <returns></returns>
        public async Task SendError(IClientProxy client, string errMessage)
        {
            await client.SendAsync("ReceiveErr", errMessage);
        }

        /// <summary>
        /// Sends the games list to the caller
        /// </summary>
        /// <returns></returns>
        public async Task UserRequestsList()
        {
            await Clients.Caller.SendAsync("ReceiveGames", GameHub.GamesList);
        }

        /// <summary>
        /// Connects the caller to the chat room
        /// </summary>
        /// <param name="roomName">The name of the group which is to be joined</param>
        /// <returns></returns>
        public async Task JoinChatRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        }

        /// <summary>
        /// Disconnects the caller from the chat room
        /// </summary>
        /// <param name="roomName">The name of the group which is to be leaved</param>
        /// <returns></returns>
        public async Task LeaveChatRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
        }

        /// <summary>
        /// Kills the target player.
        /// If the killed player is a cop or an assassin, announces the group about who won
        /// </summary>
        /// <param name="killer">The name of the killer</param>
        /// <param name="target">The name of the target</param>
        /// <param name="groupName">The name of the group in which the kill takes action</param>
        /// <returns></returns>
        public async Task KillTarget(string killer, string target, string groupName)
        {
            try
            {
                var game = GameHub.GetGame(groupName);
                if (game.Night && game.PlayerIsAssassin(killer) || !game.Night && game.PlayerIsCop(killer))
                {
                    game.KillPlayer(target);
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
                    var client = Clients.Caller;
                    await SendError(client, "Is not your turn");
                }
            }
            catch (ArgumentException)
            {
                var client = Clients.Caller;
                await SendError(client, "Game does not exists");
            }
            catch (Exception)
            {
                var client = Clients.Caller;
                await SendError(client, "Unexpected error");
            }
        }

        /// <summary>
        /// Announces the group that the assassin won
        /// </summary>
        /// <param name="groupName">The name of the group which is to be announced</param>
        /// <returns></returns>
        public async Task AssassinsWin(string groupName)
        {
            GameHub.GamesList.Remove(GameHub.GetGame(groupName));
            await Clients.Group(groupName).SendAsync("AssassinsWin");
        }

        /// <summary>
        /// Announces the group that the civilians won
        /// </summary>
        /// <param name="groupName">The name of the group which is to be announced</param>
        /// <returns></returns>
        public async Task CopWins(string groupName)
        {
            GameHub.GamesList.Remove(GameHub.GetGame(groupName));
            await Clients.Group(groupName).SendAsync("CopWins");
        }

        /// <summary>
        /// Announces the group that the day changed (from day to night or from night to day)
        /// </summary>
        /// <param name="groupName">The name of the group which is to be announced</param>
        /// <returns></returns>
        public async Task DayChanged(string groupName)
        {
            await Clients.Group(groupName).SendAsync("DayChanged", GameHub.GetGame(groupName));
        }
    }
}