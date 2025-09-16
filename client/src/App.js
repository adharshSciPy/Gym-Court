import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login/Login.jsx';
import AdminLogin from './Pages/AdminLogin/AdminLogin.jsx';
import  SidebarSwitching  from './Pages/SidebarSwitching/SidebarSwitching.jsx'; // Import the component
import ReceptionLogin from './Pages/ReceptionLogin/ReceptionLogin.jsx';
import ReceptionDashboard from './Pages/ReceptionDashboard/ReceptionDashboard.jsx'
import { useState } from 'react';

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/Adminlogin' element={<AdminLogin/>}/>
          <Route path='/Admindashboard' element={
            <SidebarSwitching 
              activeNav={activeNav} 
              setActiveNav={setActiveNav} 
            />
          }/>
          <Route path='/ReceptionLogin' element={<ReceptionLogin/>}/>
          <Route path='/Receptiondashboard' element={<ReceptionDashboard/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;