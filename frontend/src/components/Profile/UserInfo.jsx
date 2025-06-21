import React from "react";
import { Row, Card, Form, Col, Button } from "react-bootstrap";
import { useUserContext } from "../../context/UserContext";
import Loading from "../Loading";
import PassChange from "./PassChange";

const UserInfo = () => {
  const [token, setToken, user] = useUserContext();

  const handleLogout = () => {
    setToken(null);
  };

  return token && user ? (
    <Card className="user-info-card shadow-sm rounded-4">
      <Card.Header
        className="text-white fw-bold"
        style={{ backgroundColor: "#7B241C", fontSize: "1.5rem" }}
      >
        Личный кабинет
      </Card.Header>

      <Card.Body className="milk-bg p-4">
        <Row className="gy-4">
          <Col md={6}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">Фамилия</Form.Label>
                <Form.Control
                  type="text"
                  value={user.lastname}
                  readOnly
                  className="form-control-soft"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">Имя</Form.Label>
                <Form.Control
                  type="text"
                  value={user.name}
                  readOnly
                  className="form-control-soft"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">Отчество</Form.Label>
                <Form.Control
                  type="text"
                  value={user.surname}
                  readOnly
                  className="form-control-soft"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">Почта</Form.Label>
                <Form.Control
                  type="email"
                  value={user.email}
                  readOnly
                  className="form-control-soft"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted">Организация</Form.Label>
                <Form.Control
                  type="text"
                  value={user.organisation}
                  readOnly
                  className="form-control-soft"
                />
              </Form.Group>
            </Form>
          </Col>

          <Col md={6}>
            <PassChange />
          </Col>
        </Row>
      </Card.Body>

      <Card.Footer className="milk-bg p-3">
        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-100 fw-semibold"
          style={{ fontSize: "1.1rem" }}
        >
          Выйти из аккаунта
        </Button>
      </Card.Footer>
    </Card>
  ) : (
    <Loading />
  );
};

export default UserInfo;
