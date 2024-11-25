import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import RegisterModal from "./Profile/RegisterModal";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import AnonsPage from "./Anonses";

const MainPage = () => {
 
  return (
    <div className="welcome-container ">
      <Card className="milk-bg">
    <h2 className="welcome-title">
      Добро пожаловать на наш сайт!<br />
      Этот ресурс создан для удобного хранения и получения данных, а также информации о мероприятиях факультета Учителей начальных классов. Здесь вы найдете все необходимые материалы, организованные по папкам и доступные в любой момент.<br /><br />
      Мы стремимся сделать обмен информацией и доступ к ней максимально удобным и простым. Спасибо, что пользуетесь нашим сайтом!
    </h2>
    </Card>
   <><AnonsPage/></>
   </div>
  );
};

export default MainPage;
