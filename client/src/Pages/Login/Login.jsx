import React from "react";
import styles from "./Login.module.css";
import { FaDumbbell } from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";
import { FaFlag } from "react-icons/fa6"; // Flag icon for logo

function Login() {
  return (
    <div className={styles.container}>
      {/* Floating icons */}
      <div className={styles.icons}>
        <GiShuttlecock className={styles.icon} style={{ top: "10%", left: "5%" }} />
        <FaDumbbell className={styles.icon} style={{ top: "15%", left: "20%" }} />
        <GiShuttlecock className={styles.icon} style={{ top: "30%", left: "10%" }} />
        <FaDumbbell className={styles.icon} style={{ top: "40%", right: "20%" }} />
        <GiShuttlecock className={styles.icon} style={{ bottom: "20%", left: "15%" }} />
        <FaDumbbell className={styles.icon} style={{ bottom: "10%", right: "10%" }} />
        <GiShuttlecock className={styles.icon} style={{ bottom: "5%", left: "5%" }} />
        <FaDumbbell className={styles.icon} style={{ top: "60%", right: "5%" }} />
      </div>

      {/* Center card */}
      <div className={styles.card}>
        <div className={styles.logo}>
          <FaFlag className={styles.logoIcon} />
          <span className={styles.logoText}>Courtly</span>
        </div>
        <p className={styles.subtitle}>Please select your role to proceed</p>
        <h2 className={styles.title}>Welcome to Courtly</h2>

        <button className={styles.roleBtn}>Admin</button>
        <button className={styles.roleBtn}>Reception</button>

        <div className={styles.actionBtns}>
          <button className={styles.signupBtn}>Sign Up</button>
          <button className={styles.loginBtn}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
