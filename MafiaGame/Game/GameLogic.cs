using System;
using System.Collections.Generic;

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
        public bool PlayerIsCop(string playerName, string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            return game.PlayerIsCop(playerName);
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
        public int PlayersLimit;
        public bool Started { get; set; }
        public bool AssassinAlive { get; set; }
        public bool CopAlive { get; set; }
        public bool Night { get; set; }

        public Game(string firstPlayer, string roomName, string connectionId)
        {
            Name = roomName;
            PlayersLimit = 4;
            _remainingRoles = new List<Type>
                {Type.Civilian, Type.Assassin, Type.Cop, Type.Civilian, Type.Civilian};
            var random = new Random();
            var index = random.Next(_remainingRoles.Count);
            Players = new List<Player> {new Player(firstPlayer, _remainingRoles[index], connectionId)};
            _remainingRoles.RemoveAt(index);
            Started = false;
            Night = true;
            AssassinAlive = true;
            CopAlive = true;
        }

        public void AddPlayer(string name, string connectionId)
        {
            if (PlayersLimit == 0)
                throw new Exception("Game room is full");
            if (Players.Exists(x => x.Name == name))
                throw new ArgumentException("A player with this name already exists", name);
            PlayersLimit--;
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
            _remainingRoles.Add(Players[index].GetRole());
            Players.RemoveAt(index);
            PlayersLimit++;
        }

        public void KillPlayer(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            player.Alive = false;
            Night = !Night;
            if (player.GetRole() == Type.Assassin)
                AssassinAlive = false;
            else if (player.GetRole() == Type.Cop)
                CopAlive = false;
        }

        public bool PlayerIsAssassin(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            return player.GetRole() == Type.Assassin;
        }
        public bool PlayerIsCop(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            return player.GetRole() == Type.Cop;
        }
    }


    public class Player
    {
        public string Name { get; }
        private readonly Type _role;
        public bool Alive { get; set; }
        public string ConnectionId;
        public bool Ready { get; set; }

        public Player(string name, Type role, string connectionId)
        {
            Name = name;
            _role = role;
            Alive = true;
            ConnectionId = connectionId;
            Ready = false;
        }

        public Type GetRole()
        {
            return _role;
        }
    }

    public enum Type
    {
        Assassin,
        Cop,
        Civilian
    }
}