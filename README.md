<a href="https://mafia-game.azurewebsites.net/">
<img src="MafiaGame/wwwroot/dist/img/ico/android-chrome-512x512.png" align="right" height="60" alt="Mafia Game logo" title="Mafia Game"/>
</a>

# Mafia Game

[Mafia Game](https://mafia-game.azurewebsites.net/) is a rudimentary implementation of the Mafia party game, using C#, SignalR and ReactJs.

## Requirements

### Build and run

This application requires at least dotnet core 2.1 for building.
You can download it [here](https://dotnet.microsoft.com/download).

### Develop

The application was developed using Visual Studio, so an environment for VS is available.

If you want to change only the server code, which is written in C#, dotnet core 2.1 is sufficient.

If you need to change the client code, which is written in js and jsx, you need nodejs and npm.

There are a few npm scripts located in game/MafiaGame/package.json which could help in developing the client part of the game.

## Run

To run the application enter the following commands:

```shell
git clone https://github.com/isisa-mafia/game
cd game/MafiaGame
dotnet run
```

In the case that everything worked perfectly, you will be instructed which link to follow to the running application, usually <https://localhost:5000> .
