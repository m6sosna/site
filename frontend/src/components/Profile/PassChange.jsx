import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useUserContext } from "../../context/UserContext";
import ErrorMessage from "../ErrorMessage";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { notifyError, notifySuccess } from "../Notification";

const PassChange = () => {
  const [token] = useUserContext();
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to validate password strength
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
      notifyError(validationError);
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
        notifyError(data.detail || "Ошибка смены пароля");
        setErrorMessage(data.detail || "Ошибка смены пароля");
      } else {
        setPassword("");
        setConfirmationPassword("");
        notifySuccess("Пароль успешно изменён");
        setErrorMessage("Пароль успешно изменён");
      }
    } catch (error) {
      notifyError("Ошибка запроса.")
      setErrorMessage("Ошибка запроса");
    }
  };

  return (
    <Card className="mt-2">
      <Card.Body className="milk-bg">
        <Form>
          <Form.Group>
            <Form.Label>Новый пароль</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Введите новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
  
          <Form.Group className="mt-2">
            <Form.Label>Подтвердите новый пароль</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Подтвердите новый пароль"
                value={confirmationPassword}
                onChange={(e) => setConfirmationPassword(e.target.value)}
                required
              />
              <Button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Button
            className="mt-2"
            variant="primary"
            type="submit"
            onClick={handleUpdateUser}
          >
            Подтвердить
          </Button>
        </Form>
      </Card.Body>
     
    </Card>

  );
};

export default PassChange;
