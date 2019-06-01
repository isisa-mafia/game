using System;
using System.Collections.Generic;

namespace MafiaGame.Game
{
    /// <summary>
    /// The hub which contains the game rooms
    /// </summary>
    public class GameHub
    {
        /// <summary>
        /// The list of games
        /// </summary>
        public List<Game> GamesList { get; } = new List<Game>();

        /// <summary>
        /// Creates a new game
        /// </summary>
        /// <param name="playerName">The creator's name</param>
        /// <param name="gameName">The game's name</param>
        /// <param name="connectionId">The creator's connection id</param>
        public void CreateNewGame(string playerName, string gameName, string connectionId)
        {
            if (GamesList.Exists(x => x.Name == gameName))
                throw new ArgumentException("A game with this name already exists", gameName);
            GamesList.Add(new Game(playerName, gameName, connectionId));
        }

        /// <summary>
        /// Adds a player to the game
        /// </summary>
        /// <param name="playerName">The player's game</param>
        /// <param name="gameName">The game's name</param>
        /// <param name="connectionId">The player's connection id</param>
        public void AddPlayerToGame(string playerName, string gameName, string connectionId)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            game.AddPlayer(playerName, connectionId);
        }

        /// <summary>
        /// Removes a player from a game
        /// </summary>
        /// <param name="playerName">The player's name</param>
        /// <param name="gameName">The game's name</param>
        public void RemovePlayerFromGame(string playerName, string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            game.RemovePlayer(playerName);
        }

        /// <summary>
        /// Returns true if the player is an assassin
        /// </summary>
        /// <param name="playerName">The name of the player</param>
        /// <param name="gameName">The name of the game</param>
        /// <returns></returns>
        public bool PlayerIsAssassin(string playerName, string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            return game.PlayerIsAssassin(playerName);
        }

        /// <summary>
        /// Return a game by it's name
        /// </summary>
        /// <param name="gameName">The name of the game</param>
        /// <returns></returns>
        public Game GetGame(string gameName)
        {
            var game = GamesList.Find(x => x.Name == gameName);
            if (game == null)
                throw new ArgumentException("There is no game with this name", gameName);
            return game;
        }
    }

    /// <summary>
    /// The class which defines a game room
    /// </summary>
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

        /// <summary>
        /// Creates a new game
        /// </summary>
        /// <param name="firstPlayer">The name of the game's creator</param>
        /// <param name="roomName">The name of the game which is to be created</param>
        /// <param name="connectionId">The connection id of the game's creator</param>
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

        /// <summary>
        /// Adds a player to the game
        /// </summary>
        /// <param name="name">The name of the player which is to be added</param>
        /// <param name="connectionId">The connection id of the player</param>
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

        /// <summary>
        /// Removes a player from the game
        /// </summary>
        /// <param name="name">The name of the player which is to be removed</param>
        public void RemovePlayer(string name)
        {
            var index = Players.FindIndex(x => x.Name == name);
            if (index == -1)
                throw new ArgumentException("There is no player with this name", name);
            _remainingRoles.Add(Players[index].GetRole());
            Players.RemoveAt(index);
            PlayersLimit++;
        }

        /// <summary>
        /// Toggles the alive status of the player.
        /// Toggles the alive status of the cop or assassin in the case that the killed one is a cop or assassin.
        /// Changes the night status.
        /// </summary>
        /// <param name="name">The name of the target</param>
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

        /// <summary>
        /// Returns true if the player is an assassin
        /// </summary>
        /// <param name="name">The name of the player</param>
        /// <returns></returns>
        public bool PlayerIsAssassin(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            return player.GetRole() == Type.Assassin;
        }

        /// <summary>
        /// Returns true if the player is a cop
        /// </summary>
        /// <param name="name">The name of the player</param>
        /// <returns></returns>
        public bool PlayerIsCop(string name)
        {
            var player = Players.Find(x => x.Name == name);
            if (player == null)
                throw new ArgumentException("There is no player with this name", name);
            return player.GetRole() == Type.Cop;
        }
    }


    /// <summary>
    /// The class which defines a player
    /// </summary>
    public class Player
    {
        public string Name { get; }
        private readonly Type _role;
        public bool Alive { get; set; }
        public string ConnectionId;
        public bool Ready { get; set; }

        /// <summary>
        /// Creates a new player
        /// </summary>
        /// <param name="name">The name of the player</param>
        /// <param name="role">The role of the player</param>
        /// <param name="connectionId">The connection id of the player</param>
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

    /// <summary>
    /// Types of possible roles for the players
    /// </summary>
    public enum Type
    {
        Assassin,
        Cop,
        Civilian
    }
}