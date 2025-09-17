import React, { useState } from "react";
import styles from "./TrainerLogin.module.css";
import { FaFlag } from "react-icons/fa6";
import axios from "axios";
import baseUrl from "../../baseUrl";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function TrainerLogin() {
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [form, setForm] = useState({
        adminEmail: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });

        if (name === "adminEmail") {
            if (!value) {
                setEmailError("Email is required.");
            } else if (!emailRegex.test(value)) {
                setEmailError("Please enter a valid email address.");
            } else {
                setEmailError("");
            }
        }

        if (name === "password") {
            if (!value) {
                setPasswordError("Password is required.");
            } else if (value.length < 6) {
                setPasswordError("Password must be at least 6 characters.");
            } else if (!/[A-Z]/.test(value)) {
                setPasswordError(
                    "Password must contain at least one uppercase letter."
                );
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                setPasswordError(
                    "Password must contain at least one special character."
                );
            } else {
                setPasswordError("");
            }
        }
    };

    const trainerLogin = async () => {
        try {
            const res = await axios.post(`${baseUrl}/api/v1/admin/login`, form);
            if (res.status === 200) {
                navigate("/Trainerdashboard");
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ Disabled if fields are empty or invalid
    const isDisabled =
        !form.adminEmail || !form.password || emailError || passwordError;


    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <FaFlag className={styles.logoIcon} />
                    <span className={styles.logoText}>Courtly</span>
                </div>
                <p className={styles.subtitle}>Hello Trainer</p>
                <h2 className={styles.title}>Welcome to Courtly</h2>

                <div className={styles.inputDatas}>
                    <div className={styles.inputContainer}>
                        <input
                            type="email"
                            name="adminEmail"
                            placeholder="Email"
                            required
                            value={form.adminEmail}
                            onChange={handleChange}
                        />
                        {emailError && (
                            <p className={styles.errorText}>
                                {emailError}
                            </p>
                        )}
                    </div>

                    <div className={styles.inputContainer}>
                        <div className={styles.inputWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                name="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                className={styles.passwordInput}
                            />

                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.eyeIcon}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        {passwordError && (
                            <p className={styles.errorText}>
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={trainerLogin}
                        disabled={isDisabled}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TrainerLogin