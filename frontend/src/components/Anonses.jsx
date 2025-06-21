import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Card,
  Row,
  Col,
  Form,
  Modal,
} from "react-bootstrap";
import { useUserContext } from "../context/UserContext";

const AnonsPage = () => {
  const [anonses, setAnonses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnons, setEditingAnons] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [newAttachment, setNewAttachment] = useState(null);
  const [deleteAttachment, setDeleteAttachment] = useState(false);
  const [token, setToken, user] = useUserContext();
  const isAdmin = user?.role_id === 2;
  // Получение списка всех анонсов
  const fetchAnonses = async () => {
    try {
      const response = await fetch("http://localhost:8000/anons/anonses/");
      if (!response.ok) throw new Error("Ошибка при получении анонсов");
      const data = await response.json();
      setAnonses(data);
    } catch (error) {
      console.error("Ошибка загрузки анонсов:", error);
    }
  };

  // Создание или редактирование анонса
  const handleSaveAnons = async () => {
    try {
      // Проверяем, если это редактирование и пользователь не создатель
      if (editingAnons && editingAnons.creator_id !== user.id) {
        alert("У вас нет прав на редактирование этого анонса.");
        return;
      }
  
      const formData = new FormData();
      formData.append("content", newContent || "");
  
      if (newAttachment) {
        formData.append("attachment", newAttachment);
      }
  
      formData.append("delete_attachment", deleteAttachment ? "true" : "false");
  
      const url = editingAnons
        ? `http://localhost:8000/anons/anonses/${editingAnons.id}`
        : "http://localhost:8000/anons/anonses/";
  
      const method = editingAnons ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка при сохранении анонса:", errorData);
        throw new Error(errorData.detail || "Ошибка при сохранении анонса");
      }
  
      await fetchAnonses();
      setShowModal(false);
      setEditingAnons(null);
      setNewContent("");
      setNewAttachment(null);
      setDeleteAttachment(false);
  
    } catch (error) {
      console.error("Ошибка сохранения анонса:", error);
      alert(error.message || "Ошибка при сохранении анонса");
    }
  };
  
  

  // Удаление анонса
  const deleteAnons = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/anons/anonses/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Ошибка при удалении анонса");
      setAnonses(anonses.filter((anons) => anons.id !== id));
    } catch (error) {
      console.error("Ошибка удаления анонса:", error);
    }
  };

  // Открытие модального окна для редактирования анонса
  const editAnons = (anons) => {
    setEditingAnons(anons);
    setNewContent(anons.content);
    setDeleteAttachment(false);
    setShowModal(true);
  };

  // Загрузка анонсов при монтировании компонента
  useEffect(() => {
    fetchAnonses();
  }, []);

  return (
    <Container className="py-5 milk-bg">
    <div className="d-flex justify-content-between align-items-center mb-4">
      
      {isAdmin && (
        <Button
          onClick={() => {
            setShowModal(true);
            setEditingAnons(null);
          }}
          className="btn-primary"
        >
          Создать анонс
        </Button>
      )}
    </div>
  
    {anonses.length > 0 ? (
      <Row className="g-4">
        {anonses.map((anons) => (
          <Col md={6} lg={4} key={anons.id}>
            <Card className="anons-card h-100 shadow-sm">
              <Card.Body className="anons-card-body">
                <Card.Text className="anons-content">{anons.content}</Card.Text>
  
                {anons.attachment && (
                  <Card.Text className="attachment-text">
                    <small>
                      📎 Приложение:{" "}
                      <a
                        href={`http://localhost:8000/anons/anonses/${anons.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        Скачать
                      </a>
                    </small>
                  </Card.Text>
                )}
  
                {user && anons.creator_id === user.id && (
                  <div className="action-buttons mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => editAnons(anons)}
                      className="me-2"
                    >
                      ✏ Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteAnons(anons.id)}
                    >
                      🗑 Удалить
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    ) : (
      <div className="no-anons-container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "320px", color: '#7B241C' }}>
        <div className="no-anons-icon" style={{ fontSize: '4rem' }}>📢</div>
        <div className="no-anons-title" style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>Анонсов пока нет</div>
        <div className="no-anons-subtitle text-muted" style={{ color: '#A68A6D' }}>Будьте первым, кто добавит анонс!</div>
      </div>
    )}  




      {/* Модальное окно для создания или редактирования анонса */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAnons ? "Редактировать анонс" : "Создать анонс"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="content">
              <Form.Label>Текст анонса</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите текст анонса"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="attachment" className="mt-3">
              <Form.Label>Приложение (файл)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setNewAttachment(e.target.files[0])} // Обновляем состояние файла
              />
            </Form.Group>
            {editingAnons?.attachment && (
              <Form.Group controlId="deleteAttachment" className="mt-3">
                <Form.Check
                  type="checkbox"
                  label="Удалить текущее приложение"
                  checked={deleteAttachment}
                  onChange={(e) => setDeleteAttachment(e.target.checked)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveAnons}>
            {editingAnons ? "Сохранить" : "Создать"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AnonsPage;
