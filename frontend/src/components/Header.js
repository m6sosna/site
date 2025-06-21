import React, { useState } from "react";
import { Container, Navbar, Nav, NavDropdown, Modal,Button } from "react-bootstrap";
import account from "./account.png";
import LoginModal from "./Profile/LoginModal";
import { useUserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

const Header = () => {
  const [activeModal, setActiveModal] = useState(false);
  const [token,setToken , user] = useUserContext();
  const handleLogout = () => {
    setToken(null);
  };
  const handleModal = () => {
    setActiveModal(!activeModal);
  };
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Функция для открытия модального окна
  const handleShowUserGuide = () => setShowUserGuide(true);

  // Функция для закрытия модального окна
  const handleCloseUserGuide = () => setShowUserGuide(false);


  return (
    <>
      <LoginModal active={activeModal} handleModal={handleModal} />
      <Navbar sticky="top" collapseOnSelect expand="md" className="custom-navbar" bg="blue-600">
        <Container>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Главная</Nav.Link>
              <Nav.Link as={Link} to="/materials">Материалы</Nav.Link>
              <Nav.Link onClick={handleShowUserGuide} >Руководство</Nav.Link>
            </Nav>
            
            {/* Меню для аккаунта */}
            <Nav>
              {token && user ? (
                <NavDropdown title={user.name} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/account">
                    Профиль
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={handleLogout}>
                    Выйти
                  </NavDropdown.Item>
                 
                </NavDropdown>
              ) : (
                <Nav.Link onClick={handleModal}>
                  <img
                    src={account}
                    height="30"
                    width="30"
                    className="d-inline-block align-top"
                    alt="Account"
                  />
                  Войти
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Модальное окно с руководством */}
      <Modal show={showUserGuide} onHide={handleCloseUserGuide}>
        <Modal.Header closeButton>
          <Modal.Title>Руководство пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Порядок действий:</h5>
          <ol>
            <li>
              <strong>Авторизация / Регистрация: </strong> 
              Чтобы начать пользоваться сайтом, необходимо войти в свою учетную запись. Если у вас еще нет аккаунта, вы можете зарегистрироваться, следуя простым шагам. Для этого:
              <ul>
                <li>Нажмите на кнопку "Войти" или "Зарегистрироваться" в верхнем правом углу.</li>
                <li>Введите свои данные (электронная почта, пароль) и нажмите "Войти" для авторизации, либо заполните форму регистрации для создания нового аккаунта.</li>
              </ul>
            </li>
            <li>
              <strong>После входа в систему: </strong> 
              Вы сможете использовать все возможности сайта, такие как: 
              <ul>
                <li>Просмотр и скачивание материалов, организованных по папкам.</li>
                <li>Загрузка новых файлов и создание папок для удобной организации материалов.</li>
                <li>Редактирование и удаление файлов, если у вас есть соответствующие права доступа.</li>
                <li>Перейти к необходимой информации с помощью удобной навигации и поиска по материалам.</li>
              </ul>
            </li>
            <li>
              <strong>Дополнительные функции: </strong>
              <ul>
                <li>Вы можете просматривать анонсы мероприятий факультета</li>
              </ul>
            </li>
          </ol>
          <p>Если у вас возникнут вопросы по использованию сайта, всегда можно обратиться за помощью по электронному адресу sosnovskaaanuta@gmail.com.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserGuide}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default Header;
