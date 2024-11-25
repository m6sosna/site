import React, { useContext, useEffect} from 'react';

import Profile from "../components/Profile/Profile"

import { useNavigate } from 'react-router';
import { UserContext } from '../context/UserContext';
import Loading from '../components/Loading';

const Account = () => {
        const navigate = useNavigate();
        const [token, ,user] = useContext(UserContext);
        useEffect(() => {
            if (!token) {
              navigate("/")
            }

          });
        if (!token) {
            return (<><Loading/></>)
        }
        return (<>
           
            {user ? (<Profile/>) : (<></>)}
            </>
        );
};

export default Account;