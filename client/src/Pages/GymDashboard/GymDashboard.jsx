
import styles from './GymDashboard.module.css';


import React from 'react'

function GymDashboard() {

    const courts = [
        { name: "Members" }
    ]


    const stats = [
        { label: 'Total Members', value: '250' },
        { label: 'Inactive Members', value: '35' },
        { label: 'Trainers', value: '30' }
    ];


    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Dashboard</h1>
            </div>

            <div className={styles.courtsGrid}>
                {courts.map((court, index) => (
                    <div
                        key={index}
                        className={styles.courtCard}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div className={styles.courtName}>{court.name}</div>
                        {court.name === "Members" ? (
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
                                }}
                            >
                                Add
                            </button>
                        ) : (
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
                                }}
                            >
                                Book
                            </button>
                        )

                        }
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

    )
}

export default GymDashboard