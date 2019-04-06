using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.SignalR;
using Remotion.Linq.Parsing.Structure.IntermediateModel;

namespace MafiaGame.Game
{
    public class GameHub
    {
        public List<Game> GamesList { get; }

        public GameHub()
        {
            GamesList = new List<Game>();
        }

        public void CreateNewGame(string playerName, string gameName, string connectionId)
        {
            if (GamesList.Exists(x => x.Name == gameName))
                throw new ArgumentException("A game with this name already exists", gameName);
            GamesList.Add(new Game(playerName, gameName, connectionId));
        }

        public void AddPlayerToGame(string playerName, string gameName, string connectionId)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            game.AddPlayer(playerName, connectionId);
        }

        public void RemovePlayerFromGame(string playerName, string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            game.RemovePlayer(playerName);
        }

        public bool PlayerIsAssassin(string playerName, string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            return game.PlayerIsAssassin(playerName);
        }
        public Game GetGame(string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            return game;
        }
    }

    public class Game
    {
        public string Name { get; }
        public List<Player> Players { get; }
        private readonly List<Type> _remainingRoles;
        public int _playersLimit;

        public Game(string firstPlayer, string roomName, string connectionId)
        {
            Name = roomName;
            _playersLimit = 4;
            _remainingRoles = new List<Type>
                {Type.Assassin, Type.Assassin, Type.Cop, Type.Civilian, Type.Civilian};
            var random = new Random();
            var index = random.Next(_remainingRoles.Count);
            Players = new List<Player> { new Player(firstPlayer, _remainingRoles[index], connectionId) };
            _remainingRoles.RemoveAt(index);
        }

        public void AddPlayer(string name, string connectionId)
        {
            if (_playersLimit == 0)
                throw new Exception("Game room is full");
            if (Players.Exists(x => x.Name == name))
                throw new ArgumentException("A player with this name already exists", name);
            _playersLimit--;
            var random = new Random();
            var index = random.Next(_remainingRoles.Count);
            var role = _remainingRoles[index];
            Players.Add(new Player(name, role, connectionId));
            _remainingRoles.RemoveAt(index);
        }

        public void RemovePlayer(string name)
        {
            var index = Players.FindIndex(x => x.Name == name);
            if (index == -1)
                throw new ArgumentException("There is no player with this name", name);
            _remainingRoles.Add(Players[index].Role);
            Players.RemoveAt(index);
            _playersLimit++;
        }

        public void KillPlayer(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            player.Alive = false;
        }

        public bool PlayerIsAssassin(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            return player.Role == Type.Assassin;
        }
    }


    public class Player
    {
        public string Name { get; }
        public Type Role { get; }
        public bool Alive { get; set; }
        public string ConnectionId { get; set; }
        public bool Ready { get; set; }

        public Player(string name, Type role, string ConnectionId)
        {
            Name = name;
            Role = role;
            Alive = true;
            this.ConnectionId = ConnectionId;
            Ready = false;
        }
    }

    public enum Type
    {
        Assassin,
        Cop,
        Civilian
    }
}