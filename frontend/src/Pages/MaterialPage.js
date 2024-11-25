import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  ListGroup,
  Form,
  Modal,
} from "react-bootstrap";
import { FaFolder, FaDownload, FaTrashAlt } from "react-icons/fa";
import { useUserContext } from "../context/UserContext";

const MaterialsPage = () => {
  const [rootFolders, setRootFolders] = useState([]);
  const [currentFolderSubfolders, setCurrentFolderSubfolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [token, setToken, user] = useUserContext();
  const isAdmin = user?.role_id === 2;
  const [currentPath, setCurrentPath] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [allFolders, setAllFolders] = useState([]);

  // Получение списка корневых папок
  const fetchFolders = async () => {
    try {
      const response = await fetch("http://localhost:8000/files/folders");
      if (!response.ok) throw new Error("Ошибка при получении списка папок");

      const foldersData = await response.json();
      console.log("Полученные папки:", foldersData);

      // Фильтруем корневые папки (без parent_folder_id)
      const rootFolders = foldersData.filter(
        (folder) => !folder.parent_folder_id
      );
      setRootFolders(rootFolders);
    } catch (error) {
      console.error("Ошибка получения папок:", error);
    }
  };

  const handleDownloadFile = (fileId) => {
    const downloadUrl = `http://localhost:8000/files/download/${fileId}`;

    // Создаем ссылку для скачивания
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = true; // Атрибут для скачивания файла
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Получение содержимого папки
  const fetchFolderContents = async (folderId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/files/folders/${folderId}/contents`
      );
      const folderContents = await response.json();

      console.log("Ответ от API (содержимое папки):", folderContents);

      setFiles(folderContents.files);
      setCurrentFolderSubfolders(folderContents.subfolders);

      // Обновляем все папки, чтобы построить правильный путь
      setAllFolders((prevFolders) => {
        const updatedFolders = [...prevFolders];
        const folderExists = updatedFolders.some(
          (f) => f.id === folderContents.id
        );

        // Добавляем или обновляем данные о текущей папке
        if (!folderExists) updatedFolders.push(folderContents);
        return updatedFolders;
      });

      setSelectedFolder(folderId);

      // Строим хлебные крошки (путь)
      buildBreadcrumbs(folderId);
    } catch (error) {
      console.error("Ошибка получения содержимого папки:", error);
      alert("Ошибка загрузки содержимого папки.");
    }
  };

  const buildBreadcrumbs = (folderId) => {
    if (!Array.isArray(allFolders)) {
      console.error(
        "allFolders не является массивом или не передан:",
        allFolders
      );
      return;
    }

    const path = [];
    let currentFolder = allFolders.find((folder) => folder.id === folderId);

    if (!currentFolder) {
      console.error("Не удалось найти папку с id:", folderId);
      return;
    }

    // Строим путь от текущей папки к корню
    while (currentFolder) {
      path.unshift(currentFolder); // Добавляем текущую папку в начало
      currentFolder = allFolders.find(
        (folder) => folder.id === currentFolder.parent_folder_id
      );
    }

    console.log("Путь (breadcrumbs):", path);
    setBreadcrumbs(path);
  };

  const goUpOneLevel = () => {
    if (currentPath.length > 1) {
      const newPath = [...currentPath];
      newPath.pop(); // Удаляем текущую папку
      const parentFolder = newPath[newPath.length - 1]; // Получаем предыдущую папку
      setCurrentPath(newPath); // Обновляем хлебные крошки
      fetchFolderContents(parentFolder.id); // Загружаем содержимое родительской папки
    } else {
      goToRootFolder(); // Если текущая папка — корневая, возвращаемся в корень
    }
  };

  // Создание новой папки
  const handleCreateFolder = async () => {
    try {
      const response = await fetch("http://localhost:8000/files/folders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parent_folder_id: selectedFolder || null, // Корректно обрабатываем ID родительской папки
        }),
      });
      if (!response.ok) throw new Error("Ошибка при создании папки");

      setShowCreateFolderModal(false);
      setNewFolderName("");

      // Обновление списка папок
      if (selectedFolder) {
        fetchFolderContents(selectedFolder); // Обновляем содержимое текущей папки
      } else {
        fetchFolders(); // Обновляем корневые папки
      }
    } catch (error) {
      console.error("Ошибка создания папки:", error);
    }
  };

  // Загрузка файла
  const handleFilesUpload = async () => {
    if (!fileToUpload || !selectedFolder) {
      console.error("Не выбраны файлы или папка");
      return;
    }

    const formData = new FormData();
    Array.from(fileToUpload).forEach((file) => {
      formData.append("files", file);
    });
    formData.append("folder_id", selectedFolder);

    try {
      const response = await fetch(
        `http://localhost:8000/files/upload_files_to_folder`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Ошибка при загрузке файлов");

      setFileToUpload(null);
      fetchFolderContents(selectedFolder); // Обновляем содержимое папки
      setShowUploadModal(false); // Закрываем модальное окно после загрузки
    } catch (error) {
      console.error("Ошибка загрузки файлов:", error);
    }
  };

  // Удаление файла
  const handleDeleteFile = async (fileId) => {
    if (!fileId) {
      console.error("Ошибка: Не указан правильный fileId");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/files/files/delete/${fileId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        console.error(
          "Ошибка при удалении файла. Статус ответа:",
          response.status
        );
        const errorDetails = await response.json(); // Используем json() вместо text(), если сервер возвращает JSON
        console.error("Детали ошибки:", errorDetails);
        throw new Error("Ошибка при удалении файла");
      }

      console.log(`Файл с ID ${fileId} был успешно удален`);

      // После удаления файла обновляем список файлов в текущей папке
      if (selectedFolder) {
        fetchFolderContents(selectedFolder); // Обновляем содержимое выбранной папки
      } else {
        fetchFolders(); // Обновляем корневые папки, если не в какой-то конкретной папке
      }
    } catch (error) {
      console.error("Ошибка удаления файла:", error);
    }
  };

  // Удаление папки
  const handleDeleteFolder = async (folderId) => {
    if (!folderId) return;

    try {
      const response = await fetch(
        `http://localhost:8000/files/delete_folder/${folderId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Ошибка при удалении папки");

      // Если удаляем корневую папку, обновляем корневые папки
      if (!selectedFolder) {
        fetchFolders(); // Обновляем список корневых папок
      } else {
        // Если удаляем вложенную папку, обновляем содержимое текущей папки
        fetchFolderContents(selectedFolder);
      }

      // После удаления папки обновляем список корневых папок
      fetchFolders(); // Это гарантирует, что после удаления папки список будет актуальным
    } catch (error) {
      console.error("Ошибка удаления папки:", error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const goToRootFolder = () => {
    setSelectedFolder(null);
    setCurrentFolderSubfolders([]);
    setFiles([]);
    setBreadcrumbs([]);
    fetchFolders();
  };

  return (
    <Container>
      <h2 className="my-4">Папки и файлы</h2>
      <Row className="mb-3">
  {isAdmin && selectedFolder && (
    <>
      <Col md={4}>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="mt-2 w-100"
        >
          Загрузить файл
        </Button>
      </Col>
      <Col md={4}>
        <Button
          onClick={() => setShowCreateFolderModal(true)}
          className="mt-2 w-100"
        >
          Создать дочернюю папку
        </Button>
      </Col>
    </>
  )}

  {isAdmin && !selectedFolder && (
    <Col md={4}>
      <Button
        onClick={() => {
          setSelectedFolder(null); // Сбрасываем выбранную папку, чтобы создать корневую
          setShowCreateFolderModal(true);
        }}
        className="mt-2 w-100"
      >
        Создать корневую папку
      </Button>
    </Col>
  )}
</Row>

<Row className="mb-3">
  <Col>
    <h5>Текущий путь:</h5>
    <div className="d-flex align-items-center">
      {selectedFolder && (
        <Button
          variant="secondary"
          className="me-3"
          onClick={goToRootFolder}
        >
          Назад к корню
        </Button>
      )}
      <nav>
        {breadcrumbs.length > 0 ? (
          breadcrumbs.map((folder, index) => (
            <span key={folder.id}>
              <Button
                variant="link"
                className="custom-breadcrumb-link"
                onClick={() => {
                  fetchFolderContents(folder.id);
                }}
              >
                {folder.name}
              </Button>
              {index < breadcrumbs.length - 1 && " / "}
            </span>
          ))
        ) : (
          <span>Вы не выбрали папку</span>
        )}
      </nav>
    </div>
  </Col>
</Row>

      <Row>
  <Col md={3}>
    <h4>Папки</h4>
    <ListGroup style={{ maxHeight: "500px", overflowY: "auto" }}>
      {rootFolders.map((folder) => (
        <ListGroup.Item
          className="milk-bg"
          key={folder.id}
          action
          onClick={() => fetchFolderContents(folder.id)}
          active={selectedFolder === folder.id}
        >
          <FaFolder style={{ marginRight: "10px", color: "#ffc107" }} />
          {folder.name}
          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              className="float-end"
              onClick={(e) => {
                e.stopPropagation(); // Останавливаем событие клика на самой папке
                handleDeleteFolder(folder.id);
              }}
            >
              <FaTrashAlt /> Удалить
            </Button>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Col>

  <Col md={9}>
    <h4>Содержимое папки</h4>
    {selectedFolder ? (
      <>
        <ListGroup style={{ maxHeight: "500px", overflowY: "auto" }}>
          {currentFolderSubfolders.map((subfolder) => (
            <ListGroup.Item
              className="milk-bg"
              key={subfolder.id}
              action
              onClick={() => fetchFolderContents(subfolder.id)}
            >
              <FaFolder style={{ marginRight: "10px", color: "#17a2b8" }} />
              {subfolder.name}
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  className="float-end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(subfolder.id);
                  }}
                >
                  <FaTrashAlt /> Удалить
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <ListGroup className="mt-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
          {files.map((file) => (
            <ListGroup.Item
              key={file.id}
              className="d-flex justify-content-between align-items-center milk-bg"
            >
              {file.filename}
              <div>
                <a
                  href={file.download_url}
                  download
                  onClick={() => handleDownloadFile(file.id)}
                  className="btn btn-sm btn-primary me-2"
                >
                  <FaDownload /> Скачать
                </a>
                {isAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    <FaTrashAlt /> Удалить
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </>
    ) : (
      <p>Выберите папку для просмотра содержимого.</p>
    )}
  </Col>
</Row>

      {/* Модальные окна */}
      {/* Модальное окно для загрузки файла */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Загрузить файл</Modal.Title>
        </Modal.Header>
        <Modal.Body className="milk-bg">
          <Form.Group className="milk-bg">
            <Form.Label className="milk-bg">Выберите файл</Form.Label>
            <Form.Control
              className="milk-bg"
              type="file"
              multiple
              onChange={(e) => setFileToUpload(e.target.files)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="milk-bg">
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleFilesUpload}>
            Загрузить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно для создания папки */}
      <Modal
        show={showCreateFolderModal}
        onHide={() => setShowCreateFolderModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Создать новую папку</Modal.Title>
        </Modal.Header>
        <Modal.Body className="milk-bg">
          <Form.Group>
            <Form.Label className="milk-bg">Название папки</Form.Label>
            <Form.Control
              className="milk-bg"
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Введите имя папки"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="milk-bg">
          <Button
            variant="secondary"
            onClick={() => setShowCreateFolderModal(false)}
          >
            Отмена
          </Button>
          <Button variant="primary" onClick={handleCreateFolder}>
            Создать
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MaterialsPage;
