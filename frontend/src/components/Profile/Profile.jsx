import React, {useState, useContext} from "react";
import UserInfo from "./UserInfo";

import {
  Container,
  Tab,
  Nav,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
} from "react-bootstrap";

import {UserContext, useUserContext } from "../../context/UserContext";


const Profile = () => {
  const [ , ,user] = useContext(UserContext);
  const [,setToken] = useUserContext();
  const [activeTab, setActiveTab] = useState("first");
  const handleLogout = () => {
    setToken(null);
  };
  const handleSelect = (eventKey) => {
    setActiveTab(eventKey);
  };
  return (
    <>
      <Container className="p-0 mt-2">
      
            <UserInfo/>
            
           
            
             
            
      </Container>
    </>
  );
};

export default Profile;
