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
            username: this.props.username
        }
        this.createGame = this.createGame.bind(this)
        this.submit = this.submit.bind(this)
        this.games = this.games.bind(this)
    }
    componentDidMount() {
        var connection = this.state.connection;
        connection.start().then(() => {
            connection.invoke("UserRequestsList");
        }).catch((err) => { console.error(err.toString()) })
        connection.on("ReceiveGames", list => this.setState({ gameList: list }));
        connection.on("IJoinedGame", game => this.setState({ currentGame: game }));
    }
    createGame() {
        this.setState({ createGame: true });
    }
    submit() {
        var groupname = document.getElementById("groupname").value;
        if (groupname.length !== 0) {
            this.state.connection.invoke("CreateGame", this.state.username, groupname);
        }
        else {
            this.setState({ invalid: true });
        }
    }
    games() {
        if (this.state.gameList.length !== 0) {
            const games = this.state.gameList;
            const list = games.map((game, index) => <li key={game.name + index}>{game.name}</li>);
            return (<ul>{list}</ul>);
        }
        return <h1>There are no games active</h1>
    }
    render() {
        return (
            <Row style={{ height: 94 + "%", margin: 0 }}>
                <Col style={{ borderRight: "solid black 1px" }}>
                    <Button color="primary" size="lg" onClick={this.createGame}>
                        Create game
                    </Button>
                    {this.games()}
                </Col>
                <Col>
                    {this.state.currentGame == null && this.state.createGame === true
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
                        : <div>
                        </div>
                    }


                </Col>
            </Row>
        )
    }
}
