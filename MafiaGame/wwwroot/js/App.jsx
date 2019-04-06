import React from 'react';
import Header from "./Components/Header";
import NameSelect from "./Components/NameSelect"
import Lobby from "./Components/Lobby"

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: "" };
        this.onChildSubmit = this.onChildSubmit.bind(this);
        this.greeting = this.greeting.bind(this);
    }
    onChildSubmit(username) {
        this.setState({ username: username });
    }
    greeting() {
        if (this.state.username.length === 0)
            return <h1 className="display-1 mx-auto">Hello, stranger!</h1>
        else
            return <h1 className="display-1">Hello, {this.state.username}!</h1>
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