import React, { useState } from "react";
import styles from "./SettingPage.module.css";
import baseUrl from "../../baseUrl";
import axios from "axios";
import { Trash2 } from "lucide-react"

function SettingsPage() {

  const receptionsData = [
    { id: 1, name: "Vishva", date: '10/02/2025', phone: '9874545112', email: "vishva@gmal.com", password: "Vishva@123" },
    { id: 2, name: "Sanju", date: '15/02/2025', phone: '65847956454', email: "sanju@gmal.com", password: "Sanju@123" },
    { id: 3, name: "Adithyan", date: '28/02/2025', phone: '4556446554', email: "adithyan@gmal.com", password: "Adithyan@123" },
    { id: 4, name: "Gokul", date: '20/02/2025', phone: '4864554645', email: "gokul@gmal.com", password: "Gokul@123" }
  ]

  const trainersData = [
    { id: 1, name: "Akshay", date: '10/02/2025', phone: '68451531521', email: "akshay@gmal.com", password: "Akshay@123" },
    { id: 2, name: "Vinod", date: '15/02/2025', phone: '65847956454', email: "Vinod@gmal.com", password: "Vinod@123" },
    { id: 3, name: "Varun", date: '28/02/2025', phone: '4556446554', email: "varun@gmal.com", password: "Varun@123" }
  ]


  const [activeTab, setActiveTab] = useState("receptionist");

  // two separate states because the field names differ
  const [receptionistData, setReceptionistData] = useState({
    userName: "",
    receptionistEmail: "",
    password: "",
    phoneNumber: "",
  });

  const [trainerData, setTrainerData] = useState({
    trainerName: "",
    trainerEmail: "",
    password: "",
    phoneNumber: "",
    experience: "",
  });

  const [errors, setErrors] = useState({});

  // ---------- Validation ----------
  const validateField = (name, value, tab) => {
    let error = "";

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (name.includes("Name")) {
      if (!value.trim()) error = "Name is required";
      else if (value.length < 4) error = "Need at least 4 characters";
    }

    if (name.toLowerCase().includes("email")) {
      if (!value.trim()) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Enter a valid email";
    }

    if (name === "password") {
      if (!value.trim()) error = "Password is required";
      else if (tab === "trainer" ? value.length < 8 : value.length < 6) {
        error = `Password must be at least ${tab === "trainer" ? 8 : 6
          } characters`;
      }
    }

    if (name === "phoneNumber") {
      if (!value.trim()) error = "Phone number is required";
      else if (!/^\d{10}$/.test(value)) error = "Must be exactly 10 digits";
    }

    if (name === "experience") {
      if (value && isNaN(value)) error = "Experience must be a number";
    }

    return error;
  };

  const handleChange = (e, tab) => {
    const { name, value } = e.target;

    if (tab === "receptionist") {
      setReceptionistData((p) => ({ ...p, [name]: value }));
    } else {
      setTrainerData((p) => ({ ...p, [name]: value }));
    }

    setErrors((prev) => ({
      ...prev,
      [`${tab}_${name}`]: validateField(name, value, tab),
    }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const tab = activeTab;

    const data = tab === "receptionist" ? receptionistData : trainerData;

    // validate all
    const hasErrors = Object.keys(data).some(
      (key) => validateField(key, data[key], tab) !== ""
    );
    if (hasErrors) {
      alert("Please fix the errors before submitting");
      return;
    }

    const endpoint =
      tab === "receptionist"
        ? `${baseUrl}/api/v1/receptionist/register`
        : `${baseUrl}/api/v1/trainer/register`;

    try {
      const res = await axios.post(endpoint, data);
      console.log(res.data);
      alert(`${tab === "receptionist" ? "Receptionist" : "Trainer"} added successfully!`);

      // reset
      setReceptionistData({
        userName: "",
        receptionistEmail: "",
        password: "",
        phoneNumber: "",
      });
      setTrainerData({
        trainerName: "",
        trainerEmail: "",
        password: "",
        phoneNumber: "",
        experience: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting the form");
    }
  };

  // ---------- Disable button ----------
  const disableReceptionist =
    !receptionistData.userName.trim() ||
    receptionistData.userName.length < 4 ||
    !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(receptionistData.receptionistEmail) ||
    receptionistData.password.length < 6 ||
    !/^\d{10}$/.test(receptionistData.phoneNumber);

  const disableTrainer =
    !trainerData.trainerName.trim() ||
    trainerData.trainerName.length < 4 ||
    !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(trainerData.trainerEmail) ||
    trainerData.password.length < 8 || // <-- 8 chars
    !/^\d{10}$/.test(trainerData.phoneNumber) ||
    (trainerData.experience && isNaN(trainerData.experience));

  const isDisabled =
    activeTab === "receptionist" ? disableReceptionist : disableTrainer;

  // ---------- JSX ----------
  return (
    <div>
      <div className={styles.container}>
        <h2 className={styles.heading}>Settings</h2>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "receptionist" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("receptionist")}
          >
            Receptionist
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "trainer" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("trainer")}
          >
            Trainer
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {activeTab === "receptionist" ? (
            <>
              <h3 className={styles.subheading}>Add Receptionist</h3>
              <div className={styles.spacer}>
                <label>Name</label>
                <input
                  type="text"
                  name="userName"
                  value={receptionistData.userName}
                  onChange={(e) => handleChange(e, "receptionist")}
                />
                {errors["receptionist_userName"] && (
                  <span className={styles.error}>
                    {errors["receptionist_userName"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Email</label>
                <input
                  type="email"
                  name="receptionistEmail"
                  value={receptionistData.receptionistEmail}
                  onChange={(e) => handleChange(e, "receptionist")}
                />
                {errors["receptionist_receptionistEmail"] && (
                  <span className={styles.error}>
                    {errors["receptionist_receptionistEmail"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={receptionistData.password}
                  onChange={(e) => handleChange(e, "receptionist")}
                />
                {errors["receptionist_password"] && (
                  <span className={styles.error}>
                    {errors["receptionist_password"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={receptionistData.phoneNumber}
                  onChange={(e) => handleChange(e, "receptionist")}
                />
                {errors["receptionist_phoneNumber"] && (
                  <span className={styles.error}>
                    {errors["receptionist_phoneNumber"]}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className={styles.subheading}>Add Trainer</h3>
              <div className={styles.spacer}>
                <label>Name</label>
                <input
                  type="text"
                  name="trainerName"
                  value={trainerData.trainerName}
                  onChange={(e) => handleChange(e, "trainer")}
                />
                {errors["trainer_trainerName"] && (
                  <span className={styles.error}>
                    {errors["trainer_trainerName"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Email</label>
                <input
                  type="email"
                  name="trainerEmail"
                  value={trainerData.trainerEmail}
                  onChange={(e) => handleChange(e, "trainer")}
                />
                {errors["trainer_trainerEmail"] && (
                  <span className={styles.error}>
                    {errors["trainer_trainerEmail"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={trainerData.password}
                  onChange={(e) => handleChange(e, "trainer")}
                />
                {errors["trainer_password"] && (
                  <span className={styles.error}>
                    {errors["trainer_password"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={trainerData.phoneNumber}
                  onChange={(e) => handleChange(e, "trainer")}
                />
                {errors["trainer_phoneNumber"] && (
                  <span className={styles.error}>
                    {errors["trainer_phoneNumber"]}
                  </span>
                )}
              </div>
              <div className={styles.spacer}>
                <label>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={trainerData.experience}
                  onChange={(e) => handleChange(e, "trainer")}
                  placeholder="Optional"
                />
                {errors["trainer_experience"] && (
                  <span className={styles.error}>
                    {errors["trainer_experience"]}
                  </span>
                )}
              </div>
            </>
          )}

          <button className={styles.button} type="submit" disabled={isDisabled}>
            Submit
          </button>
        </form>
      </div>

      <div className={styles.listItems}>
        {activeTab === "receptionist" ? (
          <>
            <h3>Added Receiptionist</h3>
            <div className={styles.table}>

              <div className={styles.tableData}>
                <table>
                  <thead>
                    <tr>
                      <th>Sl.No</th>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receptionsData.map((value, index) => (
                      <tr key={value.id}>
                        <td>{index + 1}</td>
                        <td>{value.name}</td>
                        <td>{value.date}</td>
                        <td>{value.phone}</td>
                        <td>{value.email}</td>
                        <td>{value.password}</td>
                        <td><Trash2 color="red" /></td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3>Added Trainers</h3>
            <div className={styles.table}>

              <div className={styles.tableData}>
                <table>
                  <thead>
                    <tr>
                      <th>Sl.No</th>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainersData.map((value, index) => (
                      <tr key={value.id}>
                        <td>{index + 1}</td>
                        <td>{value.name}</td>
                        <td>{value.date}</td>
                        <td>{value.phone}</td>
                        <td>{value.email}</td>
                        <td>{value.password}</td>
                        <td><Trash2 color="red" /></td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
