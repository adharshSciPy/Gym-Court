import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import Tabs from "./Tabs";
import MemberTable from "./MemberTable";
import PaymentHistory from "./PaymentHistory";
import baseUrl from "../../baseUrl";
import axios from "axios";

const BookingForm = ({ selectedCourt, onBack,selectedCourtNumber}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: 0,
    whatsAppNumber: 0,
    address: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    amount: 0,
    isGst: false, 
    gst: 0,
    gstNumber: "",
    modeOfPayment: "cash",
    courtId:selectedCourtNumber
  });

  const tabs = [
    { id: "members", label: "Members" },
    { id: "details", label: "Book Now" },
    { id: "booking-overview", label: "Booking Overview" },
    { id: "payment-history", label: "Payment History" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "isGst" ? value === "yes" : value,
    }));
  };

  const handleSubmit = async() => {
      console.log(formData);
    try {
        const res=await axios.post(`${baseUrl}/api/v1/slot/book`,formData)
        console.log(res);
        
    } catch (error) {
        console.log(error);
        
    }
    onBack();
  };

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.bookingForm}>
        <div className={styles.formHeader}>
          <div className={styles.headerLeft}>
            <button onClick={onBack} className={styles.backButton}>
              ← Back
            </button>
            <h1 className={styles.formTitle}>Details - {selectedCourt}</h1>
          </div>
          <button onClick={handleSubmit} className={styles.updateButton}>
            Update
          </button>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "details" && (
          <div className={styles.formContent}>
            <div className={styles.detailsHeader}>
              <h2>Details</h2>
            </div>

            <div className={styles.formGrid}>
              {/* Name Inputs */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>User Member Name</label>
                <div className={styles.nameInputs}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className={styles.nameInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Enter Phone Number</label>
                  <input
                    type="number"
                    placeholder="Eg: +91XXXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Enter WhatsApp Number
                  </label>
                  <input
                    type="number"
                    placeholder="Eg: +91XXXXXXXXX"
                    value={formData.whatsAppNumber}
                    onChange={(e) =>
                      handleInputChange("whatsAppNumber", e.target.value)
                    }
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Address */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Enter Address</label>
                <textarea
                  placeholder="Home / Office"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className={styles.textareaInput}
                />
              </div>

              {/* Booking Details */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Enter Booking Details
                </label>
                <div className={styles.bookingInputs}>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className={styles.formInput}
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className={styles.formInput}
                    placeholder="End Date"
                  />
                  <input
                    type="time"
                    placeholder="Start Time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    className={styles.formInput}
                  />
                  <input
                    type="time"
                    placeholder="End Time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Billing */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Billing</label>
                <div className={styles.billingInputs}>
                  {/* Amount field - always shown */}
                  <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className={styles.formInput}
                  />

                  {/* GST Applicable dropdown */}
                  <select
                    value={formData.isGst ? "yes" : "no"}
                    onChange={(e) =>
                      handleInputChange("isGst", e.target.value)
                    }
                    className={styles.formInput}
                  >
                    <option value="no">GST: No</option>
                    <option value="yes">GST: Yes</option>
                  </select>

                  {/* Conditionally show GST fields */}
                  {formData.isGst && (
                    <>
                      <input
                        type="text"
                        placeholder="GST Amount"
                        value={formData.gst}
                        onChange={(e) =>
                          handleInputChange("gst", e.target.value)
                        }
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="GST Number"
                        value={formData.gstNumber}
                        onChange={(e) =>
                          handleInputChange("gstNumber", e.target.value)
                        }
                        className={styles.formInput}
                      />
                    </>
                  )}

                  {/* Payment Type dropdown */}
                  <select
                    value={formData.modeOfPayment}
                    onChange={(e) =>
                      handleInputChange("modeOfPayment", e.target.value)
                    }
                    className={styles.formInput}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.buttonContainer}>
                  <button className={styles.button} onClick={handleSubmit}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && <MemberTable />}
        {activeTab === "payment-history" && <PaymentHistory />}
      </div>
    </div>
  );
};

export default BookingForm;