import React from 'react';
import { Button, Form, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
            game: this.props.game,
            connection: this.props.connection,
            targets: [],
            isAssassin: false,
            isCop: false,
            gameEnded: false,
            winMessage: "",
            messages: []
        }
        this.targetsList = this.targetsList.bind(this);
        this.killTarget = this.killTarget.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.messagesList = this.messagesList.bind(this);
    }

    componentDidMount() {
        this.state.connection.on("ReceiveMessageGroup",
            (user, _, message) => this.setState({ messages: this.state.messages.concat(user + ": " + message) }));
        this.state.connection.on("YouAreCop",
            () => this.setState({
                isCop: true
            }));
        this.state.connection.on("YouAreAssassin",
            () => this.setState({
                isAssassin: true
            }));
        this.state.connection.on("AssassinsWin", () => this.setState({ gameEnded: true, winMessage: "Assassins won" }));
        this.state.connection.on("CopWins", () => this.setState({ gameEnded: true, winMessage: "Civilians won" }));
        this.state.connection.on("DayChanged", (game) => this.setState({ game: game }));
    }

    killTarget(target) {
        this.state.connection.invoke("KillTarget", this.state.username, target, this.state.game.name);
    }

    targetsList() {
        const list = this.state.game.players
            .filter(target => target.name !== this.state.username && target.alive === true)
            .map((target, index) =>
                <li className="d-flex justify-content-around align-items-center m-3" key={target.name + index}>
                    <span className="font-weight-bolder flex-grow-1">{target.name}</span>
                    <Button color="primary" onClick={() => { this.killTarget(target.name) }}>
                        Kill
                    </Button>
                </li>
            );
        if (this.state.game.players.find(player => player.name === this.state.username).alive === true) {

            if (this.state.game.night === true) {
                if (this.state.isAssassin === true)
                    return (<div>
                                <ol className="p-5 list-unstyled">{list}</ol>
                            </div>);
                else {
                    return (<div>
                                <h1>You are sleeping</h1>
                            </div>);
                }
            }
            if (this.state.game.night === false) {
                if (this.state.isCop === true)
                    return (<div>
                                <ol className="p-5 list-unstyled">{list}</ol>
                            </div>);
                else
                    return (<div>
                                <h1>Only the cop decides who dies</h1>
                            </div>);
            }
        } else {
            return (<div>
                        <h1>You are dead</h1>
                    </div>);

        }
    }

    messagesList() {
        const messages = this.state.messages;
        const list = messages.map((message, index) => <li key={"message" + index}>{message}</li>);
        return (<ul>{list}</ul>);
    }

    sendMessage(e) {
        e.preventDefault();
        const message = document.getElementById("messageInput");
        if (this.state.game.players.find(player => player.name === this.state.username).alive === true) {
            if (message.value.length !== 0) {
                this.state.connection.invoke("SendMessageGroup",
                    this.state.username,
                    this.state.game.name,
                    message.value);
                message.value = "";
            }
        } else {
            this.setState({ messages: this.state.messages.concat("GM: dead cannot speak") });
        }
    }

    render() {
        return (
            <div className="d-flex p-1 flex-grow-1">
                <div className="d-flex flex-column p-2 w-50 " style={{ borderRight: "solid grey 1px" }}>
                    <h1>Your name: {this.state.username}</h1>
                    {this.targetsList()}
                </div>
                <div className="d-flex w-50 flex-column p-3">
                    {this.state.game.night === false &&
                        <div className="d-flex flex-column" style={{ height: 100 + "%" }}>
                            <div className="border p-2 flex-grow-1 d-flex flex-column">
                                <div className="overflow-auto flex-fill d-flex flex-column-reverse mh-100 h-100">
                                    {this.messagesList()}
                                </div>
                                <Form className="d-flex flex-column" onSubmit={this.sendMessage}>
                                    <Input id="messageInput" className="mb-2"/>
                                    <Button color="primary">Send</Button>
                                </Form>
                            </div>
                        </div>
                    }
                </div>
                <Modal isOpen={this.state.gameEnded} className={this.props.className}>
                    <ModalHeader>Game Over</ModalHeader>
                    <ModalBody>
                        <h3>{this.state.winMessage}</h3>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.props.endGame}>Ok</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}