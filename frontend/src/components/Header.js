import React, { useState } from "react";
import {
  Container,
  Navbar,
  Nav,
} from "react-bootstrap";
import account from "./account.png";
import LoginModal from "./Profile/LoginModal"
import { useUserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

const Header = () => {
  const [activeModal, setActiveModal] = useState(false);
  const [ token, , user ] = useUserContext();

  const handleModal = () => {
    setActiveModal(!activeModal);
  };

  return (
    <>
      <LoginModal active={activeModal} handleModal={handleModal} />
      <Navbar 
        sticky="top"
        collapseOnSelect
        expand="md"
        className="custom-navbar"
        bg="blue-600"
        
      >
        <Container bg="blue-600">
        
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto " bg="$blue-600">
              <Nav.Link as={Link} to="/">Главная</Nav.Link>
              <Nav.Link as={Link} to="/materials">Материалы</Nav.Link>
            </Nav>
            {token && user ? (
              <Navbar.Brand as={Link} to="/account">
                {user.name}
                <img
                  src={account}
                  height="30"
                  width="30"
                  className="d-inline-block align-top"
                  alt="Account"
                />
              </Navbar.Brand>
            ) : (
              <>
              <Navbar.Brand onClick={handleModal}>
                <img
                  src={account}
                  height="30"
                  width="30"
                  className="d-inline-block align-top"
                  alt="Account"
                />
              </Navbar.Brand>
             
            </>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;