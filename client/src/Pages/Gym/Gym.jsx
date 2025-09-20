import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, MessageCircle, Eye } from 'lucide-react';
import styles from './Gym.module.css';
import axios from "axios"
import baseUrl from "../../baseUrl"
import { Modal } from 'antd';

const Gym = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('members');
    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [trainerFilter, setTrainerFilter] = useState("");
    const [members, setMembers] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(5);
    const [subscriptionFilter, setSubscriptionFilter] = useState('');
    const [combinedFilter, setCombinedFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModal, setEditModal] = useState(false);
    const [userId, setUserId] = useState("")

    const showModal = (id) => {
        setUserId(id)
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const editModal = (id) => {
        setUserId(id)
        setEditModal(true);
    };
    const edithandleOk = (id) => {
        setEditModal(false);
    };
    const edithandleCancel = () => {
        setEditModal(false)
    }


    // Fetch members with filters & pagination
    const fetchMembers = async () => {
        try {
            const params = { page, limit, search: searchTerm };

            if (userTypeFilter) params.userType = userTypeFilter;
            if (subscriptionFilter) params.status = subscriptionFilter;
            if (trainerFilter) params.trainerName = trainerFilter;

            const res = await axios.get(`${baseUrl}/api/v1/gym/all-users`,
                { params }
            );
            console.log(res)
            setMembers(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // No users found
                setMembers([]);
                setTotalPages(1);
            } else {
                console.error("Error fetching members:", error);
            }

        }
    };

    // Fetch trainers for dropdown
    const fetchTrainers = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/v1/trainer/all-trainers`);
            console.log("train", res)
            setTrainers(res.data.trainers);
        } catch (error) {
            setTrainers([]);
            console.error("Error fetching trainers:", error);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    // Refetch when page, searchTerm, or userTypeFilter changes
    useEffect(() => {
        fetchMembers();
    }, [page, searchTerm, userTypeFilter, subscriptionFilter, trainerFilter]);


    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${year}/${month}/${day}`;
    };

    // helper (put near top of file or in utils)
    const normalizeWhatsApp = (raw) => {
        if (raw === undefined || raw === null) return null;

        // If it's an object like { number: '...' } try to get the number field
        if (typeof raw === "object") {
            if (raw.number) raw = raw.number;
            else return null;
        }

        // convert to string and strip non-digits
        const digits = String(raw).trim().replace(/\D/g, "");

        if (!digits) return null;

        // If number looks local (10 digits) assume India (91) — change as needed
        if (digits.length === 10) return "91" + digits;

        // otherwise return as-is (already contains country code)
        return digits;
    };

    // open whatsapp with optional pre-filled message
    const openWhatsApp = (rawNumber, name = "") => {
        const phone = normalizeWhatsApp(rawNumber);
        if (!phone) {
            alert("No valid WhatsApp number provided.");
            return;
        }

        const message = `Hi ${name || "there"}, I wanted to check in about your membership.`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };




    return (
        <div className={styles.dashboard}>
            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>Members</h1>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <div className={styles.contentContainer}>
                        {/* Tabs */}
                        <div className={styles.tabs}>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : styles.tabInactive
                                    }`}
                            >
                                Members
                            </button>
                            <button
                                onClick={() => setActiveTab('addMembers')}
                                className={`${styles.tab} ${activeTab === 'addMembers' ? styles.tabActive : styles.tabInactive
                                    }`}
                            >
                                Add Members
                            </button>
                        </div>

                        {/* Content based on active tab */}
                        {activeTab === 'members' ? (
                            <>
                                <div className={styles.searchselect}>
                                    {/* Search Bar */}
                                    <div className={styles.searchContainer}>
                                        <Search className={styles.searchIcon} />
                                        <input
                                            type="text"
                                            placeholder="Search members"
                                            className={styles.searchInput}
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setPage(1);
                                                setSearchTerm(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <div className={styles.selectmembers}>
                                        <select
                                            value={combinedFilter}
                                            onChange={(e) => {
                                                setPage(1);
                                                const value = e.target.value;
                                                setCombinedFilter(value);

                                                // Reset both filters first
                                                setUserTypeFilter("");
                                                setSubscriptionFilter("");

                                                // Apply filter based on selection
                                                if (["athlete", "non-athlete"].includes(value)) {
                                                    setUserTypeFilter(value);
                                                } else if (["active", "expired"].includes(value)) {
                                                    setSubscriptionFilter(value);
                                                }
                                            }}
                                        >
                                            <option className={styles.selectoption} value="">Select</option>
                                            <option className={styles.selectoption} value="athlete">Athlete</option>
                                            <option className={styles.selectoption} value="non-athlete">Non Athlete</option>
                                            <option className={styles.selectoption} value="active">Active Members</option>
                                            <option className={styles.selectoption} value="expired">Inactive Members</option>
                                        </select>
                                    </div>
                                    <div className={styles.selectmembers}>
                                        <select
                                            value={trainerFilter}
                                            onChange={(e) => {
                                                setPage(1);
                                                setTrainerFilter(e.target.value);
                                            }}
                                        >
                                            <option value="">All Trainers</option>
                                            {Array.isArray(trainers) && trainers.map(trainer => (
                                                <option key={trainer._id} value={trainer.trainerName}>
                                                    {trainer.trainerName}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                </div>


                                {/* Table */}
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead className={styles.tableHeader}>
                                            <tr>
                                                <th className={styles.tableHeaderCell}>Name</th>
                                                <th className={styles.tableHeaderCell}>Phone Number</th>
                                                <th className={styles.tableHeaderCell}>WhatsApp Number</th>
                                                <th className={styles.tableHeaderCell}>Joining date</th>
                                                <th className={styles.tableHeaderCell}>Ended Date</th>
                                                <th className={styles.tableHeaderCell}>Actions</th>
                                                <th className={styles.tableHeaderCell}>Subscription Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map((member, index) => (
                                                <tr key={index} className={styles.tableRow}>
                                                    <td className={`${styles.tableCell} ${styles.tableCellName}`}>{member.name}</td>
                                                    <td className={styles.tableCell}>{member.phoneNumber}</td>
                                                    <td className={styles.tableCell}>{member.whatsAppNumber}</td>
                                                    <td className={styles.tableCell}>{formatDate(member.subscription.startDate)}</td>
                                                    <td className={styles.tableCell}>{formatDate(member.subscription.endDate)}</td>
                                                    <td className={styles.tableCell}>
                                                        <div className={styles.actionButtons}>
                                                            <button className={`${styles.actionButton} ${styles.actionButtonMessage}`}
                                                                onClick={() => openWhatsApp(member.whatsAppNumber, member.name)}
                                                            >
                                                                <MessageCircle color='green' className="w-4 h-4" />
                                                            </button>
                                                            <button className={`${styles.editButton} ${styles.actionButtonEdit}`}
                                                                onClick={() => editModal()}
                                                            >
                                                                <Edit color='#000' className="w-4 h-4" />
                                                            </button>
                                                            <button className={`${styles.deleteButton} ${styles.actionButtonDelete}`}

                                                            >
                                                                <Trash2 color='red' className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        <div className={styles.statusContainer}>
                                                            <span className={`${styles.statusBadge} ${member.subscription.status === 'active'
                                                                ? styles.statusActive
                                                                : styles.statusExpired
                                                                }`}>
                                                                {member.subscription.status.toUpperCase()}
                                                            </span>
                                                            {member.subscription.status === "expired" && (
                                                                <button className={styles.renewButton} onClick={() => showModal(member._id)}>
                                                                    Renew
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className={styles.pagination}>
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                    >
                                        Prev
                                    </button>
                                    <span> Page {page} of {totalPages} </span>
                                    <button
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>

                            </>
                        ) : (

                            <div className={styles.formWrapper}>
                                <div className={styles.formContainer}>
                                    <h2 className={styles.formTitle}>Add Members</h2>

                                    <form className={styles.form}>

                                        <div className={styles.formSection}>
                                            <label className={styles.sectionLabel}>Enter Member Name</label>
                                            <div className={styles.formRow}>
                                                <input
                                                    type="text"
                                                    className={styles.formInput}
                                                    placeholder="First Name"
                                                />
                                                <input
                                                    type="text"
                                                    className={styles.formInput}
                                                    placeholder="Last Name"
                                                />
                                            </div>
                                        </div>


                                        <div className={styles.formSection}>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.sectionLabel}>Enter Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className={styles.formInput}
                                                        placeholder="eg: +91 9847634893"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.sectionLabel}>Enter whatsapp Number</label>
                                                    <input
                                                        type="tel"
                                                        className={styles.formInput}
                                                        placeholder="eg: +91 9847634893"
                                                    />
                                                </div>
                                            </div>
                                        </div>


                                        <div className={styles.formSection}>
                                            <label className={styles.sectionLabel}>Enter Address</label>
                                            <textarea
                                                rows={3}
                                                className={styles.formTextarea}
                                                placeholder="Home/Office"
                                            ></textarea>
                                        </div>


                                        <div className={styles.formSection}>
                                            <label className={styles.sectionLabel}>Health Note</label>
                                            <textarea
                                                rows={3}
                                                className={styles.formTextarea}
                                                placeholder="Enter your health information"
                                            ></textarea>
                                        </div>


                                        <div className={styles.formSection}>
                                            <label className={styles.sectionLabel}>Assign Trainers</label>
                                            <select className={styles.formSelect}>
                                                <option value="">All Trainers</option>
                                                {Array.isArray(trainers) && trainers.map(trainer => (
                                                    <option key={trainer._id} value={trainer.trainerName}>
                                                        {trainer.trainerName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.formSection}>
                                            <label className={styles.sectionLabel}>Profile Picture</label>
                                            <input
                                                type="file"
                                                className={styles.formInput}
                                                style={{ width: "64.5rem" }}
                                            />
                                        </div>


                                        <div className={styles.formSection}>
                                            <label className={styles.sectionLabel}>Billing</label>
                                            <div className={styles.billingRow}>
                                                <input className={styles.formInput} type='date' />
                                                <input
                                                    type="number"
                                                    className={styles.formInput}
                                                    placeholder="Enter Amount for Booking"
                                                />
                                                <select className={styles.formSelect}>
                                                    <option value="">Select</option>
                                                    <option value="cash">Cash</option>
                                                    <option value="card">Card</option>
                                                    <option value="online">Online</option>
                                                    <option value="upi">UPI</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formButtons}>
                                            <button
                                                type="submit"
                                                className={styles.submitButton}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <Modal
                title="Renew Subscriptions"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={1000}
            >
                <div className={styles.formSection}>
                    <label className={styles.sectionLabel}>Billing</label>
                    <div className={styles.billingRow}>
                        <input className={styles.formInput} type='date' />
                        <input
                            type="number"
                            className={styles.formInput}
                            placeholder="Enter Amount for Booking"
                        />
                        <select className={styles.formSelect}>
                            <option value="">Select</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="online">Online</option>
                            <option value="upi">UPI</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formButtons}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        Add
                    </button>
                </div>

            </Modal>

            <Modal
                title="Edit Gym User"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isEditModal}
                onOk={edithandleOk}
                onCancel={edithandleCancel}
                width={800}
            >
                <div className={styles.editModal}>
                    <div>
                        <label className={styles.sectionLabel}>Enter Your Name</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className={styles.sectionLabel}>Enter Phone Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                </div>

                <div className={styles.editModal}>
                    <div>
                        <label className={styles.sectionLabel}>Enter Whatsapp Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                    <div>
                        <label className={styles.sectionLabel}>Enter Phone Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                </div>

                <div className={styles.editModal}>
                    <div>
                        <label className={styles.sectionLabel}>Enter Phone Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                    <div>
                        <label className={styles.sectionLabel}>Enter Phone Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                </div>

                <div className={styles.editModal}>
                    <div>
                        <label className={styles.sectionLabel}>Enter Phone Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                    <div>
                        <label className={styles.sectionLabel}>Enter Phone Number</label>
                        <input
                            type="tel"
                            className={styles.formInput}
                            placeholder="eg: +91 9847634893"
                        />
                    </div>
                </div>
                <div className={styles.formButtons}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        Edit
                    </button>
                </div>




            </Modal>
        </div>
    );
};

export default Gym;