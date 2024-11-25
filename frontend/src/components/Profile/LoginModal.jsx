import React, { useState, useContext } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { UserContext } from "../../context/UserContext";
import ErrorMessage from "../ErrorMessage";
import RegisterModal from "./RegisterModal";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { notifyError, notifySuccess, notifyWarn } from "../Notification";

const LoginModal = ({ active, handleModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [, setToken] = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerModalActive, setRegisterModalActive] = useState(false); // состояние для регистрации

  const validateEmail = (email) => {
    return email ? "" : "Введите корректный email";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");

    const emailValidationResult = validateEmail(email);
    if (emailValidationResult) {
      setEmailError(emailValidationResult);
      notifyWarn(emailValidationResult);
      return;
    }

    if (!password) {
      setPasswordError("Введите пароль");
      notifyWarn("Введите пароль");
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(
        `grant_type=&username=${email}&password=${password}&scope=&client_id=&client_secret=`
      ),
    };

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/auth/jwt/login",
        requestOptions
      );
      const data = await response.json();

      if (!response.ok) {
        if (data.detail === "LOGIN_BAD_CREDENTIALS") {
          setErrorMessage("Ошибка логина или пароля");
          notifyError("Ошибка логина или пароля");
        } else {
          setErrorMessage(data.detail);
        }
      } else {
        setToken(data.access_token);
        closeForm();
      }
    } catch (error) {
      setErrorMessage("Ошибка отправки запроса");
      notifyError("Ошибка запроса");
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");
    setShowPassword(false);
    handleModal();
  };

  return (
    <>
      <Modal show={active} onHide={closeForm}>
        <Modal.Header className="d-flex justify-content-center">
          <Modal.Title>Авторизация</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!emailError}
              />
              <Form.Control.Feedback type="invalid">
                {emailError}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Пароль</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!passwordError}
                />
                <Button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {passwordError}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <ErrorMessage message={errorMessage} />
            <Modal.Footer className="d-flex justify-content-center">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Авторизация"
                )}
              </Button>
              <Button onClick={() => setRegisterModalActive(true)}>
                Регистрация
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <RegisterModal
        active={registerModalActive}
        handleModal={() => setRegisterModalActive(false)}
      />
    </>
  );
};

export default LoginModal;
