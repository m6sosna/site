import React, { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem("myapp"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await fetch("http://localhost:8000/users/me", requestOptions);
        if (!response.ok) {
          setToken(null);
          throw new Error("Unauthorized");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Fetch user error:", error.message);
        setToken(null);
        setUser(null);

      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("myapp", token);
    } else {
      localStorage.removeItem("myapp");
    }
  }, [token]);

  return (
    <UserContext.Provider value={[ token, setToken, user]}>
      {props.children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};