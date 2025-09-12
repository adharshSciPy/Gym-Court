import React, { useState } from "react";
import styles from "./AdminLogin.module.css";
import { FaDumbbell } from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";
import { FaFlag } from "react-icons/fa6";
import axios from "axios"
import baseUrl from "../../baseUrl";

function AdminLogin() {
  const [form,setForm]=useState({
    email:"",
    password:""
  })
  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    })
  }
  const adminLogin=async()=>{
    try {
      const res =await axios.post(`${baseUrl}/api/v1/admin/login`,form)
      console.log(res);
      
    } catch (error) {
      console.log(error);
      
    }
  }
  return (
    <div className={styles.container}>
      {/* Floating icons */}
      <div className={styles.icons}>
        <GiShuttlecock
          className={styles.icon}
          style={{ top: "10%", left: "5%" }}
        />
        <FaDumbbell
          className={styles.icon}
          style={{ top: "15%", left: "20%" }}
        />
        <GiShuttlecock
          className={styles.icon}
          style={{ top: "30%", left: "10%" }}
        />
        <FaDumbbell
          className={styles.icon}
          style={{ top: "40%", right: "20%" }}
        />
        <GiShuttlecock
          className={styles.icon}
          style={{ bottom: "20%", left: "15%" }}
        />
        <FaDumbbell
          className={styles.icon}
          style={{ bottom: "10%", right: "10%" }}
        />
        <GiShuttlecock
          className={styles.icon}
          style={{ bottom: "5%", left: "5%" }}
        />
        <FaDumbbell
          className={styles.icon}
          style={{ top: "60%", right: "5%" }}
        />
      </div>

      {/* Center card */}
      <div className={styles.card}>
        <div className={styles.logo}>
          <FaFlag className={styles.logoIcon} />
          <span className={styles.logoText}>Courtly</span>
        </div>
        <p className={styles.subtitle}>Hello Admin</p>
        <h2 className={styles.title}>Welcome to Courtly</h2>

        <div className={styles.inputDatas}>
          <input type="text" name="email" placeholder="Email" required value={form.email} onChange={handleChange}/>
          <input type="password" placeholder="Password" name="password" required value={form.password} onChange={handleChange} />
          <button onClick={adminLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
