import React from "react";
import { Row, Card, Form, Col, Button  } from "react-bootstrap";
import { useUserContext } from "../../context/UserContext";
import Loading from "../Loading";
import PassChange from "./PassChange";

const UserInfo = () => {
  const [token,setToken , user] = useUserContext();
  const handleLogout = () => {
    setToken(null);
  };
  
  return token && user ? (
    <>
      {
       <Card>
       <Card.Header style={{ fontWeight: "bold" }}>Аккаунт</Card.Header>
       <Card.Body className="milk-bg">
           <Row>
               <Col sm={6}>
                   <Form>
                       <Form.Group>
                           <Form.Label>Фамилия</Form.Label>
                           <Form.Control type="text" value={user.lastname} readOnly />
                       </Form.Group>
                       <Form.Group className="mt-2">
                           <Form.Label>Имя</Form.Label>
                           <Form.Control type="text" value={user.name} readOnly />
                       </Form.Group>
                       <Form.Group className="mt-2">
                           <Form.Label>Отчество</Form.Label>
                           <Form.Control type="text" value={user.surname} readOnly />
                       </Form.Group>
                       <Form.Group className="mt-2">
                           <Form.Label>Почта</Form.Label>
                           <Form.Control type="email" value={user.email} readOnly />
                       </Form.Group>
                       <Form.Group className="mt-2">
                           <Form.Label>Организация</Form.Label>
                           <Form.Control type="text" value={user.organisation} readOnly />
                       </Form.Group>
                   </Form>
               </Col>
               <Col sm={6}>
                   <PassChange />
               </Col>
           </Row>
       </Card.Body>
       <Card.Footer className="milk-bg">
                <Button variant="danger" onClick={handleLogout} style={{ width: "100%" }}>
                    Выйти из аккаунта
                </Button>
            </Card.Footer>
   </Card>
      }
    </>
  ) : (
    <Loading/>
  );
};

export default UserInfo;
