import React, { useState } from 'react';
import styles from "./SettingPage.module.css";
import baseUrl from '../../baseUrl';
import axios from "axios";

function SettingsPage() {
  const [formData, setFormData] = useState({
    userName: "",
    receptionistEmail: "",
    password: "",
    phoneNumber: ""
  });

  const [errors, setErrors] = useState({
    userName: "",
    receptionistEmail: "",
    password: "",
    phoneNumber: ""
  });

  const validateField = (name, value) => {
    let error = "";

    if (name === "userName") {
      if (!value.trim()) {
        error = "Name is required";
      } else if (value.length < 4) {
        error = "Need at least 4 characters";
      }
    }

    if (name === "receptionistEmail") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        error = "Enter a valid email";
      }
    }

    if (name === "password") {
      if (!value.trim()) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }

    if (name === "phoneNumber") {
      if (!value.trim()) {
        error = "Phone number is required";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Phone number must be exactly 10 digits";
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final validation before submit
    const hasErrors = Object.keys(formData).some(
      (key) => validateField(key, formData[key])
    );
    if (hasErrors) {
      alert("Please fix the errors before submitting");
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}/api/v1/receptionist/register`, formData);
      console.log(res.data);
      alert("Receptionist added successfully!");
      setFormData({
        userName: "",
        receptionistEmail: "",
        password: "",
        phoneNumber: ""
      });
      setErrors({
        userName: "",
        receptionistEmail: "",
        password: "",
        phoneNumber: ""
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting the form");
    }
  };

  // Disable button if any field is invalid or has errors
  const isDisabled =
    !formData.userName.trim() ||
    formData.userName.length < 4 ||
    !formData.receptionistEmail.trim() ||
    !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.receptionistEmail) ||
    !formData.password.trim() ||
    formData.password.length < 6 ||
    !formData.phoneNumber.trim() ||
    !/^\d{10}$/.test(formData.phoneNumber);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Settings</h2>
      <div className={styles.main}>
        <div className={styles.addreceptionist}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h3 className={styles.subheading}>Add Receptionist</h3>

            <div className={styles.spacer}>
              <label>Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter name"
              />
              {errors.userName && <span className={styles.error}>{errors.userName}</span>}
            </div>

            <div className={styles.spacer}>
              <label>Email</label>
              <input
                type="email"
                name="receptionistEmail"
                value={formData.receptionistEmail}
                onChange={handleChange}
                placeholder="Enter email"
              />
              {errors.receptionistEmail && <span className={styles.error}>{errors.receptionistEmail}</span>}
            </div>

            <div className={styles.spacer}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.spacer}>
              <label>Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
            </div>

            <button className={styles.button} type="submit" disabled={isDisabled}>
              Submit
            </button>
          </form>
        </div>

        <div className={styles.addtrainer}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h3 className={styles.subheading}>Add Trainer</h3>

            <div className={styles.spacer}>
              <label>Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter name"
              />
              {errors.userName && <span className={styles.error}>{errors.userName}</span>}
            </div>

            <div className={styles.spacer}>
              <label>Email</label>
              <input
                type="email"
                name="receptionistEmail"
                value={formData.receptionistEmail}
                onChange={handleChange}
                placeholder="Enter email"
              />
              {errors.receptionistEmail && <span className={styles.error}>{errors.receptionistEmail}</span>}
            </div>

            <div className={styles.spacer}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.spacer}>
              <label>Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
            </div>

            <button className={styles.button} type="submit" disabled={isDisabled}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
