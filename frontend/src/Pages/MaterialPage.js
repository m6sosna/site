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
  const currentUserId = user?.id?? null;
  const isAdmin = user?.role_id === 2;
  const [currentPath, setCurrentPath] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
const [renameFolderName, setRenameFolderName] = useState("");
const [folderToRename, setFolderToRename] = useState(null);
console.log("rootFolders", rootFolders);
console.log("currentFolderSubfolders", currentFolderSubfolders);
console.log("files", files);
console.log("currentUserId", currentUserId);

const openRenameModal = (folderId, currentName) => {
  setFolderToRename(folderId);
  setRenameFolderName(currentName);
  setShowRenameModal(true);
};

// Закрытие модального окна
const closeRenameModal = () => {
  setShowRenameModal(false);
  setRenameFolderName("");
  setFolderToRename(null);
};

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
      const response = await fetch(`http://localhost:8000/files/files/folders/${folderId}/contents`);
      
      console.log('HTTP статус:', response.status);
      const text = await response.text();
      console.log('Raw ответ:', text);
      
      if (!response.ok) {
        throw new Error("Не удалось загрузить содержимое папки");
      }
  
      const folderContents = JSON.parse(text);
      console.log('Ответ от сервера:', folderContents);
  
      setFiles(folderContents.files || []);
      setCurrentFolderSubfolders(folderContents.subfolders || []);
  
      const currentFolder = {
        id: folderContents.id,
        name: folderContents.name,
        created_at: folderContents.created_at,
        parent_folder_id: folderContents.parent_folder_id,
        creator_id: folderContents.creator_id,
      };
  
      setAllFolders((prev) => {
        const exists = prev.some(f => f.id === currentFolder.id);
        return exists ? prev : [...prev, currentFolder];
      });
  
      setSelectedFolder(folderId);
  
    } catch (error) {
      console.error("Ошибка получения содержимого папки:", error);
      alert("Ошибка загрузки содержимого папки.");
    }
  };
  
  
  useEffect(() => {
    if (selectedFolder !== null) {
      buildBreadcrumbs(selectedFolder);
    }
  }, [allFolders, selectedFolder]);
  
  const buildBreadcrumbs = (folderId) => {
    if (!Array.isArray(allFolders)) {
      console.error("allFolders не является массивом или не передан:", allFolders);
      return;
    }
  
    const path = [];
    let currentFolder = allFolders.find((folder) => folder.id === folderId);
  
    if (!currentFolder) {
      console.error("Не удалось найти папку с id:", folderId);
      setBreadcrumbs([]); // Очистить хлебные крошки, если не нашли
      return;
    }
  
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = allFolders.find(
        (folder) => folder.id === currentFolder.parent_folder_id
      );
    }
  
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


  const handleCreateFolder = async () => {
    try {
      
      
      const response = await fetch("http://localhost:8000/files/folders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  
        },
        body: JSON.stringify({
          name: newFolderName,
          parent_folder_id: selectedFolder || null,
          creator_id: user.id, 
        }),
      });
  
      if (!response.ok) throw new Error("Ошибка при создании папки");
  
      setShowCreateFolderModal(false);
      setNewFolderName("");
  
      if (selectedFolder) {
        await fetchFolderContents(selectedFolder);
      } else {
        fetchFolders();
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
          headers: token
            ? {
                Authorization: `Bearer ${token}`, // Если токен есть, добавляем заголовок
              }
            : {},
          body: formData,
        }
      );
  
      if (!response.ok) {
        if (response.status === 403) {
          alert("Вы не являетесь создателем этой папки, доступ запрещён");
          return;
        }
        throw new Error("Ошибка при загрузке файлов");
      }
  
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
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );
  
      if (!response.ok) {
        if (response.status === 401) {
          alert("У вас нет прав для удаления этого файла");
          return;
        }
        if (response.status === 403) {
          alert("У вас нет прав для удаления этого файла");
          return;
        }
  
        console.error(
          "Ошибка при удалении файла. Статус ответа:",
          response.status
        );
        const errorDetails = await response.json();
        console.error("Детали ошибки:", errorDetails);
        throw new Error("Ошибка при удалении файла");
      }
  
      console.log(`Файл с ID ${fileId} был успешно удален`);
  
      // После удаления файла обновляем список файлов в текущей папке
      if (selectedFolder) {
        fetchFolderContents(selectedFolder);
      } else {
        fetchFolders();
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
        {
          method: "DELETE",
          headers: token
            ? {
                "Authorization": `Bearer ${token}`,
              }
            : {},
        }
      );
  
      if (!response.ok) {
        if (response.status === 401 ) {
          alert("У вас нет доступа к этой папке.");
          return;
        }
        if (response.status === 403) {
          alert("У вас нет доступа к этой папке.");
          return;
        }
        throw new Error("Ошибка при удалении папки");
      }
  
      if (folderId === selectedFolder) {
        goToRootFolder();
      } else {
        await fetchFolderContents(selectedFolder);
      }
  
      await fetchFolders();
    } catch (error) {
      console.error("Ошибка удаления папки:", error);
      alert(error.message);
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
    fetchFolders(); // Загрузка корневых папок
  };
 
  const handleRenameFolder = async () => {
    if (!folderToRename || !renameFolderName.trim()) return;
  
    try {
     
      const response = await fetch(
        `http://localhost:8000/files/folders/${folderToRename}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({  name: renameFolderName,
            creator_id: currentUserId,
           }),
        }
      );
  
      if (!response.ok) {
        if (response.status === 401) {
          alert("Вы не авторизованы. Пожалуйста, войдите.");
          return;
        }
        if (response.status === 403) {
          alert("У вас нет доступа к этой папке");
          return;
        }
        if (response.status === 404) {
          alert("Папка не найдена");
          return;
        }
        if (response.status === 400) {
          const errorData = await response.json();
          alert(errorData.detail || "Папка с таким именем уже существует.");
          return;
        }
        throw new Error("Ошибка при переименовании папки");
      }
  
      const data = await response.json();
  
      // Обновление состояния
      setRootFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderToRename ? { ...folder, name: data.folder.name } : folder
        )
      );
  
      setCurrentFolderSubfolders((prevSubfolders) =>
        prevSubfolders.map((subfolder) =>
          subfolder.id === folderToRename ? { ...subfolder, name: data.folder.name } : subfolder
        )
      );
  
      setAllFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderToRename ? { ...folder, name: data.folder.name } : folder
        )
      );
  
      closeRenameModal();
      alert("Папка успешно переименована!");
    } catch (error) {
      console.error("Ошибка при переименовании папки:", error);
      alert(error.message);
    }
  };
  
  
  return (
    <Container>
      <div className="welcome-container milk-bg shadow rounded-4">
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
                setSelectedFolder(null);
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
      <Button variant="secondary" className="me-3" onClick={goToRootFolder}>
        Назад к корню
      </Button>
    )}
    <div
      className="px-3 py-2"
      style={{
        backgroundColor: "#A68A6D",
        borderRadius: "8px",
        color: "#fff",
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.1)",
        maxWidth: "100%",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      <nav>
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 ? (
          breadcrumbs
            .filter(folder => folder && folder.id != null)
            .map((folder, index) => (
              <span key={folder.id}>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => fetchFolderContents(folder.id)}
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                    fontWeight: "bold"
                  }}
                >
                  {folder.name}
                </Button>
                {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
              </span>
            ))
        ) : (
          <span>Вы не выбрали папку</span>
        )}
      </nav>
    </div>
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
                <div className="d-flex justify-content-end gap-2">
                  {isAdmin && folder.creator_id === currentUserId && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameModal(folder.id, folder.name);
                        }}
                      >
                        Переименовать
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                      >
                        <FaTrashAlt /> Удалить
                      </Button>
                    </>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={9}>
          <h4>Содержимое папки</h4>
          {selectedFolder ? (
            <>
              <ListGroup
                style={{
                  maxHeight: "calc(50vh - 50px)",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
              >
                {currentFolderSubfolders?.length ? (
                  currentFolderSubfolders.map((subfolder) => (
                    <ListGroup.Item
                      className="milk-bg"
                      key={subfolder.id}
                      action
                      onClick={() => fetchFolderContents(subfolder.id)}
                    >
                      <FaFolder style={{ marginRight: "10px", color: "#17a2b8" }} />
                      {subfolder.name}
                      {isAdmin && subfolder.creator_id === currentUserId && (
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(subfolder.id);
                            }}
                          >
                            <FaTrashAlt /> Удалить
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRenameModal(subfolder.id,currentUserId);
                            }}
                          >
                            Переименовать
                          </Button>
                        </div>
                      )}
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item className="milk-bg">Папок нет</ListGroup.Item>
                )}
              </ListGroup>

              <ListGroup
                style={{
                  maxHeight: "calc(50vh - 100px)",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                {files?.length ? (
                  files.map((file) => (
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
                        {isAdmin && file.creator_id === currentUserId && (
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
                  ))
                ) : (
                  <ListGroup.Item className="milk-bg">Файлы отсутствуют</ListGroup.Item>
                )}
              </ListGroup>
            </>
          ) : (
            <p>Выберите папку для просмотра содержимого.</p>
          )}
        </Col>
      </Row>
      </div>
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
      <Modal show={showRenameModal} onHide={closeRenameModal}>
  <Modal.Header closeButton>
    <Modal.Title>Переименовать папку</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form.Group>
      <Form.Label>Новое имя папки</Form.Label>
      <Form.Control
        type="text"
        value={renameFolderName}
        onChange={(e) => setRenameFolderName(e.target.value)}
        placeholder="Введите новое имя папки"
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={closeRenameModal}>
      Отмена
    </Button>
    <Button variant="primary" onClick={handleRenameFolder}>
      Сохранить
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
};

export default MaterialsPage;
