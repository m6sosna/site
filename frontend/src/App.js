import './App.css';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css'
import { UserProvider } from './context/UserContext';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Account from "./Pages/Account";
import Footer from './components/Footer';
import 'react-quill/dist/quill.snow.css';
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.bubble.css";

import MaterialsPage from './Pages/MaterialPage';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <UserProvider>
          <Header />
     
          <div className='page-background'>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/account" element={<Account />} />
              <Route exact path='materials' element={<MaterialsPage/>}/>
            </Routes>
          </div>
          <Footer />
        </UserProvider>
      </Router>
    </div>
  );
}

export default App;
