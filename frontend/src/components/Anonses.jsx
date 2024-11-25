import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Form, Modal } from 'react-bootstrap';

const AnonsPage = () => {
    const [anonses, setAnonses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingAnons, setEditingAnons] = useState(null);
    const [newContent, setNewContent] = useState('');
    const [newAttachment, setNewAttachment] = useState(null);
    const [deleteAttachment, setDeleteAttachment] = useState(false);

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
        const formData = new FormData();
        formData.append("content", newContent || ""); // Значение content должно быть строкой
        
        if (newAttachment) {
            formData.append("attachment", newAttachment); // Файл для загрузки
        }
    
        formData.append("delete_attachment", deleteAttachment ? "true" : "false");
    
        try {
            const url = editingAnons
                ? `http://localhost:8000/anons/anonses/${editingAnons.id}`
                : "http://localhost:8000/anons/anonses/";
            const method = editingAnons ? "PUT" : "POST";
    
            const response = await fetch(url, {
                method: method,
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Получаем ответ об ошибке
                console.error("Ошибка при сохранении анонса:", errorData);
                throw new Error("Ошибка при сохранении анонса");
            }
    
            fetchAnonses();
            setShowModal(false);
            setEditingAnons(null);
            setNewContent('');
            setNewAttachment(null);
            setDeleteAttachment(false);
        } catch (error) {
            console.error("Ошибка сохранения анонса:", error);
        }
    };
    
    
    // Удаление анонса
    const deleteAnons = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/anons/anonses/${id}`, { method: "DELETE" });
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
        <Container>
            <h2 className="my-4">Анонсы</h2>

            <Button onClick={() => { setShowModal(true); setEditingAnons(null); }} className="mb-3">Создать анонс</Button>

            <Row>
                {anonses.map((anons) => (
                    <Col md={6} lg={4} key={anons.id} className="mb-4">
                        <Card>
                            <Card.Body style={{ backgroundColor: "#fff8e7" }}>
                                <Card.Text>{anons.content}</Card.Text>
                                {anons.attachment && (
                                    <Card.Text>
                                        <small>
                                            Приложение:{" "}
                                            <a 
                                                href={`http://localhost:8000/anons/anonses/${anons.id}/download`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Скачать
                                            </a>
                                        </small>
                                    </Card.Text>
                                )}
                                <Button variant="primary" onClick={() => editAnons(anons)} className="me-2">Редактировать</Button>
                                <Button variant="danger" onClick={() => deleteAnons(anons.id)}>Удалить</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Модальное окно для создания или редактирования анонса */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingAnons ? "Редактировать анонс" : "Создать анонс"}</Modal.Title>
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
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
                    <Button variant="primary" onClick={handleSaveAnons}>{editingAnons ? "Сохранить" : "Создать"}</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AnonsPage;