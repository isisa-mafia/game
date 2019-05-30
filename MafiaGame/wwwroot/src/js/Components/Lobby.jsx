import React, { Component } from "react"
import { Button, Form, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
import * as signalR from "@aspnet/signalr"

export default class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connection: new signalR.HubConnectionBuilder().withUrl("/chatHub").build(),
            modal: false,
            createGame: false,
            gameList: [],
            invalid: false,
            currentGame: null,
            username: this.props.username,
            messages: []
        }
        this.createGame = this.createGame.bind(this);
        this.leaveGame = this.leaveGame.bind(this);
        this.submit = this.submit.bind(this);
        this.gamesList = this.gamesList.bind(this);
        this.playersList = this.playersList.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.submitModal = this.submitModal.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.messagesList = this.messagesList.bind(this);
    }

    componentDidMount() {
        var connection = this.state.connection;
        connection.start().then(() => {
            connection.invoke("UserRequestsList");
        }).catch((err) => { console.error(err.toString()) });
        connection.on("ReceiveGames", list => this.setState({ gameList: list }));
        connection.on("ReceiveMessageGroup",
            (user, _, message) => this.setState({ messages: this.state.messages.concat(user + ": " + message) }));
        connection.on("IJoinedGame", game => this.setState({ currentGame: game }));
        connection.on("GameReady",
            () => {
                this.toggleModal();
            });
        connection.on("StartGame",
            () => this.props.startGame(this.state.connection, this.state.username, this.state.currentGame));
        if (process.env.NODE_ENV !== "production")
            connection.on("ReceiveErr", message => console.log(message));
        connection.onclose(() => { this.state.currentGame !== null && this.leaveGame(); });
    }

    createGame() {
        if (this.state.currentGame === null)
            this.setState({ createGame: true });
    }

    leaveGame() {
        const connection = this.state.connection;
        connection.invoke("LeaveGame", this.state.username, this.state.currentGame.name);
        this.setState({ createGame: false, currentGame: null, messages: [] });
    }

    joinGame(gameName) {
        if (this.state.currentGame === null && this.state.createGame === false) {
            const connection = this.state.connection;
            connection.invoke("JoinGame", this.state.username, gameName);
        }
    }

    submit(e) {
        e.preventDefault();
        const groupname = document.getElementById("groupname").value;
        if (groupname.length !== 0) {
            this.state.connection.invoke("CreateGame", this.state.username, groupname);
            this.setState({ createGame: false });
        } else {
            this.setState({ invalid: true });
        }
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    submitModal(e) {
        e.preventDefault();
        const connection = this.state.connection;
        connection.invoke("PlayerReady", this.state.username, this.state.currentGame.name);
        this.toggleModal();
    }

    gamesList() {
        if (this.state.gameList.length !== 0) {
            const games = this.state.gameList;
            const list = games.map((game, index) =>
                <li className="d-flex justify-content-around align-items-center m-3" key={game.name + index}>
                    <span className="font-weight-bolder flex-grow-1">{game.name}</span>
                    <span className="badge badge-secondary mx-3">{5 - game.playersLimit}/5</span>
                    <Button color="primary" onClick={(e) => this.joinGame(game.name, e)}>
                        Join game
                    </Button>
                </li>
            );

            return (<ol className="p-5 list-unstyled">{list}</ol>);
        }
        return <h2 className="text-center pt-5">There are no active games</h2>;
    }

    playersList() {
        const players = this.state.currentGame.players;
        const list =
            players.map(
                (player, index) => <li className="list-inline-item" key={player.name + index}>{player.name}</li>);
        return (<ul className="list-inline list-unstyled">{list}</ul>);
    }

    messagesList() {
        const messages = this.state.messages;
        const list = messages.map((message, index) => <li key={"message" + index}>{message}</li>);
        return (<ul>{list}</ul>);
    }

    sendMessage(e) {
        e.preventDefault();
        const message = document.getElementById("messageInput");
        if (message.value.length !== 0) {
            this.state.connection.invoke("SendMessageGroup",
                this.state.username,
                this.state.currentGame.name,
                message.value);
            message.value = "";
        }
    }

    render() {
        return (
            <div className="d-flex p-1 flex-grow-1">
                <div className="d-flex flex-column p-2 w-50 " style={{ borderRight: "solid grey 1px" }}>
                    <Button className="mx-auto" color="primary" size="lg" onClick={this.createGame}>
                        Create game
                    </Button>
                    {this.gamesList()}
                </div>
                <div className="d-flex w-50 flex-column p-3">
                    {this.state.createGame === true
                        ? <div>
                              <Form id="groupForm" className="d-flex align-items-center justify-content-between flex-column" onSubmit={
                                this.submit}>
                                  <Label for="groupname" className="text-center">Group name</Label>
                                  <Input id="groupname" className="flex-fill m-2" invalid={this.state.invalid}/>
                                  <Button color="primary" size="lg">
                                      Create
                                  </Button>
                              </Form>
                          </div>
                        : this.state.currentGame !== null &&
                        <div className="d-flex flex-column" style={{ height: 100 + "%" }}>
                            <div className="d-flex justify-content-between flex-column">
                                <h1>Game name: {this.state.currentGame.name}</h1>
                                <Button color="danger" onClick={this.leaveGame}>
                                    Leave game
                                </Button>
                            </div>
                            <h1>Players:</h1>
                            {this.playersList()}
                            <div className="border p-2 flex-grow-1 d-flex flex-column">
                                <div className="overflow-auto flex-fill d-flex flex-column-reverse mh-100 h-100">
                                    {this.messagesList()}
                                </div>
                                <Form className="d-flex flex-column" onSubmit={this.sendMessage}>
                                    <Input id="messageInput" className="mb-2" invalid={this.state.invalid}/>
                                    <Button color="primary">Send</Button>
                                </Form>
                            </div>
                        </div>
                    }
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} className={this.props.className}>
                    <ModalHeader toggle={this.toggleModal}>Ready check</ModalHeader>
                    <ModalBody>
                        <h3>Are you ready?</h3>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.submitModal}>Ready</Button>{" "}
                        <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}