import React, { Component } from 'react'
import { Col, Row, Button, Form, Label, Input } from 'reactstrap'
import * as signalR from "@aspnet/signalr"

export default class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connection: new signalR.HubConnectionBuilder().withUrl("/chatHub").build(),
            createGame: false,
            gameList: [],
            invalid: false,
            currentGame: null,
            username: this.props.username,
            messages: []
        }
        this.createGame = this.createGame.bind(this)
        this.leaveGame = this.leaveGame.bind(this)
        this.submit = this.submit.bind(this)
        this.gamesList = this.gamesList.bind(this)
        this.playersList = this.playersList.bind(this)
        this.messagesList = this.messagesList.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }
    componentDidMount() {
        var connection = this.state.connection;
        connection.start().then(() => {
            connection.invoke("UserRequestsList");
        }).catch((err) => { console.error(err.toString()) })
        connection.on("ReceiveGames", list => this.setState({ gameList: list }));
        connection.on("ReceiveMessageGroup", (user, _, message) => this.setState({ messages: this.state.messages.concat(user + " says: " + message) }));
        connection.on("IJoinedGame", game => this.setState({ currentGame: game }));
        connection.on("ReceiveErr", message => console.log(message));
        connection.onclose(() => { this.state.currentGame !== null && this.leaveGame(); });
    }
    createGame() {
        this.setState({ createGame: true });
    }
    leaveGame() {
        var connection = this.state.connection;
        connection.invoke("LeaveGame", this.state.username, this.state.currentGame.name);
        this.setState({ createGame: false, currentGame: null, messages: [] });
    }
    joinGame(gameName) {
        if (this.state.currentGame === null && this.state.createGame === false) {
            var connection = this.state.connection;
            connection.invoke("JoinGame", this.state.username, gameName);
        }
    }
    submit() {
        var groupname = document.getElementById("groupname").value;
        if (groupname.length !== 0) {
            this.state.connection.invoke("CreateGame", this.state.username, groupname);
            this.setState({ createGame: false });
        }
        else {
            this.setState({ invalid: true });
        }
    }
    gamesList() {
        if (this.state.gameList.length !== 0) {
            const games = this.state.gameList;
            const list = games.map((game, index) => <li key={game.name + index}>{game.name}<Button color="primary" onClick={(e) => this.joinGame(game.name, e)}>Join game</Button></li>);
            return (<ul>{list}</ul>);
        }
        return <h1>There are no active games</h1>
    }
    playersList() {
        const players = this.state.currentGame.players;
        const list = players.map((player, index) => <li key={player.name + index}>{player.name}</li>);
        return (<ul>{list}</ul>);
    }
    messagesList() {
        const messages = this.state.messages;
        const list = messages.map((message, index) => <li key={'message' + index}>{message}</li>);
        return (<ul>{list}</ul>);
    }
    sendMessage() {
        var message = document.getElementById('messageInput');
        if (message.value.length !== 0) {
            this.state.connection.invoke("SendMessageGroup", this.state.username, this.state.currentGame.name, message.value);
            message.value = '';
        }
    }
    render() {
        return (
            <Row style={{ height: 94 + "%", margin: 0 }}>
                <Col style={{ borderRight: "solid black 1px" }}>
                    <Button color="primary" size="lg" onClick={this.createGame}>
                        Create game
                    </Button>
                    {this.gamesList()}
                </Col>
                <Col>
                    {this.state.createGame === true
                        ?
                        <div>
                            <Form id="groupForm">
                                <Label for="groupname">Group name</Label>
                                <Input id="groupname" invalid={this.state.invalid} />
                            </Form>
                            <Button color="primary" size="lg" onClick={this.submit}>
                                Create
                            </Button>
                        </div>
                        : this.state.currentGame !== null &&
                        <div>
                            <h1>Game name: {this.state.currentGame.name}</h1>
                            <Button color="danger" size="lg" onClick={this.leaveGame}>
                                Leave game
                            </Button>
                            <h1>Players</h1>
                            {this.playersList()}
                            <Form >
                                <Input id="messageInput" invalid={this.state.invalid} />
                            </Form>
                            <Button color="primary" onClick={this.sendMessage}>Send</Button>
                            {' '}
                            {this.messagesList()}
                        </div>
                    }


                </Col>
            </Row>
        )
    }
}
