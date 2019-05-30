import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, Input, Label } from 'reactstrap';

export default class NameSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            invalid: false
        };

        this.toggle = this.toggle.bind(this);
        this.submit = this.submit.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal,
            invalid: false
        }));
    }

    submit(e) {
        e.preventDefault();
        const userNameInput = document.getElementById("username");
        if (userNameInput.value.length !== 0) {
            this.props.onSubmit(userNameInput.value);
            this.setState({ invalid: false });
            this.toggle();
        } else {
            this.setState({ invalid: true });
        }
    }

    render() {
        return (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Button color="primary" size="lg" style={{
                    fontSize: 4 + "vmax",
                    width: 20 + "vmax",
                    height: 10 + "vmax"
                }}
                        onClick={this.toggle}>
                    {this.props.buttonLabel}
                </Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Choose a name</ModalHeader>
                    <ModalBody>
                        <Form id="userForm" onSubmit={this.submit}>
                            <Label for="username">Username</Label>
                            <Input id="username" invalid={this.state.invalid}/>
                        </Form>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.submit}>Submit</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}