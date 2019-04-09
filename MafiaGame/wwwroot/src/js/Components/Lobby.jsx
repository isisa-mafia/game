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
        if (process.env.NODE_ENV !== 'production')
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
    submit(e) {
        e.preventDefault();
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
            const list = games.map((game, index) => <li key={game.name + index}>{game.name}&nbsp;<Button color="primary" onClick={(e) => this.joinGame(game.name, e)}>Join game</Button></li>);
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
    sendMessage(e) {
        e.preventDefault();
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
                            <Form id="groupForm" className="d-flex align-items-center" onSubmit={this.submit}>
                                <Label for="groupname">Group name</Label>
                                <Input id="groupname" className="flex-grow-1" invalid={this.state.invalid} />
                                &nbsp;
                                <Button color="primary" size="lg" >
                                    Create
                            </Button>
                            </Form>
                        </div>
                        : this.state.currentGame !== null &&
                        <div className="d-flex flex-column" style={{ height: 100 + '%' }}>
                            <div className="d-flex justify-content-between">
                                <h1>Game name: {this.state.currentGame.name}</h1>
                                <Button color="danger" size="lg" onClick={this.leaveGame}>
                                    Leave game
                            </Button>
                            </div>
                            <h1>Players</h1>
                            {this.playersList()}
                            <div className="chat flex-grow-1 d-flex flex-column-reverse">
                                <Form className="d-flex" onSubmit={this.sendMessage}>
                                    &nbsp;
                                    <Input id="messageInput" className="flex-fill" invalid={this.state.invalid} />
                                    &nbsp;
                                    <Button color="primary">Send</Button>
                                    &nbsp;
                                </Form>
                                {this.messagesList()}
                            </div>
                        </div>
                    }
                </Col>
            </Row>
        )
    }
}
