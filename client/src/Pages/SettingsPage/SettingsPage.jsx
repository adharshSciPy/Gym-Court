import React, { useState, useEffect } from "react";
import styles from "./SettingPage.module.css";
import baseUrl from "../../baseUrl";
import axios from "axios";
import { Trash2 } from "lucide-react"

function SettingsPage() {

  const [trainersData, setTrainersData] = useState([]);
  const [receptionsData, setReceptionsData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState("");


  const fetchTrainers = async () => {
    try {
      const trainerdetails = await axios.get(`${baseUrl}/api/v1/trainer/all-trainers`);
      setTrainersData(trainerdetails.data.trainers)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchReceptionist = async () => {
    try {
      const receptionsdetails = await axios.get(`${baseUrl}/api/v1/receptionist/all-receptionists`);
      setReceptionsData(receptionsdetails.data.receptionists)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchReceptionist();
    fetchTrainers();
  }, [])

  const deleteTrainer = async (id) => {
    try {
      const trainerRes = await axios.delete(`${baseUrl}/api/v1/trainer/delete/${id}`)
      console.log("deleteTrainer", trainerRes)
      fetchTrainers()
    } catch (error) {
      console.log(error)
    }
  }

  const deleteReception = async (id) => {
    try {
      const receptionRes = await axios.delete(`${baseUrl}/api/v1/receptionist/delete/${id}`)
      console.log("deleteReception", receptionRes)
      fetchReceptionist()
    } catch (error) {
      console.log(error)
    }
  }


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
      fetchReceptionist();
      fetchTrainers();

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

  const isDisabled = activeTab === "receptionist" ? disableReceptionist : disableTrainer;

  // Converts ISO date string to DD/MM/YYYY
  function formatDate(isoDate) {
    if (!isoDate) return "";

    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }





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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receptionsData.map((value, index) => (
                      <tr key={value._id}>
                        <td>{index + 1}</td>
                        <td>{value.userName}</td>
                        <td>{formatDate(value.createdAt)}</td>
                        <td>{value.phoneNumber}</td>
                        <td>{value.receptionistEmail}</td>
                        <td><Trash2
                          color="red"
                          onClick={() => {
                            setDeleteId(value._id);
                            setDeleteType("receptionist");
                            setShowModal(true);
                          }}
                        />
                        </td>
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
                      <th>Experience</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainersData.map((value, index) => (
                      <tr key={value._id}>
                        <td>{index + 1}</td>
                        <td>{value.trainerName}</td>
                        <td>{formatDate(value.createdAt)}</td>
                        <td>{value.phoneNumber}</td>
                        <td>{value.trainerEmail}</td>
                        <td>{value.experience}</td>
                        <td><Trash2
                          color="red"
                          onClick={() => {
                            setDeleteId(value._id);
                            setDeleteType("trainer");
                            setShowModal(true);
                          }}
                        />
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this {deleteType}?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteBtn}
                onClick={async () => {
                  if (deleteType === "trainer") {
                    await deleteTrainer(deleteId);
                  } else {
                    await deleteReception(deleteId);
                  }
                  setShowModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsPage;
