// BookingForm.js
import React, { useState } from 'react';
import styles from "./AdminDashboard.module.css";
import Tabs from './Tabs'; // Import Tabs component

const BookingForm = ({ selectedCourt, onBack }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    billing: 'Hourly',
    paymentType: 'Cash',
    rate: ''
  });

  const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'details', label: 'Book Now' },
    { id: 'booking-overview', label: 'Booking Overview' },
    { id: 'payment-history', label: 'Payment History' },
    { id: 'reports', label: 'Reports' },
    { id: 'bills', label: 'Bills' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', { ...formData, court: selectedCourt });
    alert(`Booking for ${selectedCourt} submitted successfully!`);
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

        {activeTab === 'details' && (
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
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={styles.formInput}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className={styles.nameInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Enter Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Eg: +91XXXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Enter WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="Eg: +91XXXXXXXXX"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
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
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={styles.textareaInput}
                />
              </div>

              {/* Booking Details */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Enter Booking Details</label>
                <div className={styles.bookingInputs}>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                    className={styles.formInput}
                  />
                  <input
                    type="time"
                    placeholder="Start Time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={styles.formInput}
                  />
                  <input
                    type="time"
                    placeholder="End Time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Billing */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Billing</label>
                <div className={styles.billingInputs}>
                  <select
                    value={formData.billing}
                    onChange={(e) => handleInputChange('billing', e.target.value)}
                    className={styles.formInput}
                  >
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Monthly</option>
                  </select>
                  <input
                    type="text"
                    placeholder="High amount for Booking"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className={styles.formInput}
                  />
                  <select
                    value={formData.paymentType}
                    onChange={(e) => handleInputChange('paymentType', e.target.value)}
                    className={styles.formInput}
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>UPI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'details' && (
          <div className={styles.tabContent}>
            <h3>{tabs.find(t => t.id === activeTab)?.label}</h3>
            <p>Content for {tabs.find(t => t.id === activeTab)?.label} will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
