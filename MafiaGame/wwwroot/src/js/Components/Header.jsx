import React from "react";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap"

export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        return (
            <Navbar color="dark" dark expand="md" style={{}}>
                <NavbarToggler onClick={this.toggle} />
                <NavbarBrand href="/">MafiaGame</NavbarBrand>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink href="https://github.com/isisa-mafia/game">GitHub</NavLink>
                        </NavItem>
                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret color="dark">
                                About
                                </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem href="/documentation">
                                    Documentation
                                    </DropdownItem>
                                <DropdownItem>
                                    About the game
                                    </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem>
                                    Whatever
                                    </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }
}