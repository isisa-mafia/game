import React from 'react';
import Header from "./Components/Header";
import NameSelect from "./Components/NameSelect"
import Lobby from "./Components/Lobby"
import Game from "./Components/Game"

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            gameStarted: false,
            connection: null,
            game: null
        };
        this.onChildSubmit = this.onChildSubmit.bind(this);
        this.startGame = this.startGame.bind(this);
        this.endGame = this.endGame.bind(this);
    }

    onChildSubmit(username) {
        this.setState({ username: username });
    }

    startGame(connection, username, game) {
        this.setState({
            gameStarted: true,
            connection: connection,
            username: username,
            game: game
        });
    }
    endGame() {
        this.setState({
            gameStarted: false,
            connection: null,
            game: null 
        });

    }

    render() {
        return (
            <div className="d-flex flex-column h-100">
                <Header/>
                {this.state.gameStarted === false
                    ? (this.state.username.length === 0
                        ? <NameSelect buttonLabel="Play" onSubmit={this.onChildSubmit} />
                        : <Lobby username={this.state.username} startGame={this.startGame} />)
                    : <Game connection={this.state.connection} username={this.state.username}
                        game={this.state.game} endGame={this.endGame}/>
                }
            </div>
        );
    }
}