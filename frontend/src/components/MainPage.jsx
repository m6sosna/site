import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import AnonsPage from "./Anonses";

const MainPage = () => {

 
  return (
<div className="welcome-container milk-bg shadow rounded-4">
  <Card className="border-0 bg-transparent">
    <h2 className="welcome-title mb-4" style={{ color: '#5A3E36' }}>
      Добро пожаловать на наш сайт <span style={{ color: '#D35400' }}>«Методическое сопровождение практических занятий по экологии»</span>
    </h2>
    <p className="text-center" style={{ fontSize: '1.1rem', color: '#5A3E36', maxWidth: '800px', margin: '0 auto' }}>
      Этот ресурс создан для удобной работы учителя, проводящего занятия курса практической экологии для младших школьников.
      Здесь вы найдёте все необходимые материалы, организованные по папкам и доступные в любой момент.
    </p>

    <div className="d-flex justify-content-center mt-4">
      <a
        href="http://localhost:8000/download-book"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary px-4 py-2"
        style={{ fontSize: '1.1rem', borderRadius: '30px' }}
      >
        📄 Скачать учебник
      </a>
    </div>
  </Card>

  <AnonsPage />
</div>

  
  
  );
};

export default MainPage;
