// AdminDashboard.js
import React, { useState } from 'react';
import styles from './AdminDashboard.module.css';
import BookingForm from './BookingForm';

function AdminDashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);

  const courts = [
    { id: 1, name: 'Court 1' },
    { id: 2, name: 'Court 2' },
    { id: 3, name: 'Court 3' },
    { id: 4, name: 'Court 4' }
  ];

  const stats = [
    { label: 'Total Members', value: '250' },
    { label: 'Inactive Members', value: '180' },
    { label: 'Booking Details', value: '35' },
    { label: 'Payment History', value: '30' }
  ];

  const handleBookNow = (court) => {
    setSelectedCourt(court.name);
    setShowBookingForm(true);
  };

  const handleBackToDashboard = () => {
    setShowBookingForm(false);
    setSelectedCourt(null);
  };

  if (showBookingForm) {
    return <BookingForm selectedCourt={selectedCourt} onBack={handleBackToDashboard} />;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Dashboard</h1>
      </div>

      <div className={styles.courtsGrid}>
        {courts.map((court) => (
          <div
            key={court.id}
            className={styles.courtCard}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className={styles.courtName}>{court.name}</div>
            <button
              className={styles.bookButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleBookNow(court);
              }}
            >
              Book
            </button>
          </div>
        ))}
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={styles.statCard}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
          >
            <p className={styles.statLabel}>{stat.label}</p>
            <h2 className={styles.statValue}>{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
