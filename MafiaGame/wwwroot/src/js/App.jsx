import React from 'react';
import Header from "./Components/Header";
import NameSelect from "./Components/NameSelect"
import Lobby from "./Components/Lobby"

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: "" };
        this.onChildSubmit = this.onChildSubmit.bind(this);
    }
    onChildSubmit(username) {
        this.setState({ username: username });
    }
    render() {
        return (
            <React.Fragment>
                <Header />
                {this.state.username.length === 0 ?
                    <NameSelect buttonLabel="Play" onSubmit={this.onChildSubmit} /> : <Lobby username={this.state.username} />}
            </React.Fragment>
        );
    }
}