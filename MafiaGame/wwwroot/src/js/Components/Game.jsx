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
            isCop: false
        }
        this.targetsList = this.targetsList.bind(this);
        this.killTarget = this.killTarget.bind(this);
    }

    componentDidMount() {
        this.state.connection.on("GetTargets",
            (targets) => this.setState({
                targets: targets,
                isAssassin: true
            }));
        this.state.connection.on("YouAreCop",
            () => this.setState({
                isCop: true
            }));
        this.state.connection.on("AssassinsWin", () => alert("Assassins won"));
        this.state.connection.on("CopWins", () => alert("Civilians win"));
        this.state.connection.on("DayChanged", (game) => this.setState({ game: game }));
    }

    killTarget(target) {
        this.state.connection.invoke("KillTarget", this.state.username, target, this.state.game.name);
    }

    targetsList() {
        const list = this.state.game.players.filter(target => target.name != this.username)
            .map((target, index) =>
                <li className="d-flex justify-content-around align-items-center m-3" key={target.name + index}>
                    <span className="font-weight-bolder flex-grow-1">{target.name}</span>
                    <Button color="primary" onClick={() => { this.killTarget(target.name) }}>
                        Kill
                    </Button>
                </li>
            );
        return (<div>
                    <ol className="p-5 list-unstyled">{list}</ol>
                </div>);
    }

    render() {
        return (
            <div className="d-flex p-1 flex-grow-1">
                <h1>Your name:
                {this.state.username}</h1>

                {this.state.game.night == true ? <h2>Assassins turn</h2> : <h2>Civilian turn</h2>}
                {(this.state.game.night === true && this.state.game.isAssassin === true)? this.targetsList(): <h3>Is not your turn</h3>}
                {(this.state.game.night === false && this.state.game.isCop === true) ? this.targetsList() : <h3>You are civilian</h3>}
            </div>
        );
    }
}