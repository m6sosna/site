import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useUserContext } from "../../context/UserContext";

import { FaEye, FaEyeSlash } from "react-icons/fa";


const PassChange = () => {
  const [token] = useUserContext();
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const validatePassword = (password, confirmationPassword) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpaces = /\s/.test(password);

    if (password !== confirmationPassword) {
      return "Пароли не совпадают";
    } else if (password.length < minLength) {
      return "Пароль должен содержать минимум 8 символов";
    } else if (!hasUpperCase) {
      return "Пароль должен содержать минимум одну заглавную букву";
    } else if (!hasLowerCase) {
      return "Пароль должен содержать минимум одну строчную букву";
    } else if (!hasNumbers) {
      return "Пароль должен содержать минимум одну цифру";
    } else if (hasSpaces) {
      return "Пароль не должен содержать пробелы";
    } else {
      return "";
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const validationError = validatePassword(password, confirmationPassword);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        password: password,
      }),
    };

    try {
      const response = await fetch(
        `http://localhost:8000/customusers/me`,
        requestOptions
      );
      const data = await response.json();

      if (!response.ok) {

        setErrorMessage(data.detail || "Ошибка смены пароля");
      } else {
        setPassword("");
        setConfirmationPassword("");

        setErrorMessage("Пароль успешно изменён");
      }
    } catch (error) {

      setErrorMessage("Ошибка запроса");
    }
  };

  return (
    <Card className="mt-3 user-pass-change-card shadow-sm rounded-3">
    <Card.Body className="milk-bg p-4">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold text-muted">Новый пароль</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control-soft"
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold text-muted">Подтвердите новый пароль</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Подтвердите новый пароль"
              value={confirmationPassword}
              onChange={(e) => setConfirmationPassword(e.target.value)}
              required
              className="form-control-soft"
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          onClick={handleUpdateUser}
          className="w-100 fw-semibold"
        >
          Подтвердить
        </Button>
      </Form>
    </Card.Body>
  </Card>
);
};


export default PassChange;
