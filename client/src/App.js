import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login/Login.jsx';
import AdminLogin from './Pages/AdminLogin/AdminLogin.jsx';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard.jsx';
import ReceptionLogin from './Pages/ReceptionLogin/ReceptionLogin.jsx';


function App() {
  return (
    <div className="App">
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Login/>}/>
    <Route path='/Adminlogin' element={<AdminLogin/>}/>
    <Route path='/Admindashboard' element={<AdminDashboard/>}/>
    <Route path='/ReceptionLogin' element={<ReceptionLogin/>}/>



   </Routes>
   </BrowserRouter>
    </div>
  );
}

export default App;
