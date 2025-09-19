import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, MessageCircle, Eye } from 'lucide-react';
import styles from './GymMembers.module.css';
import axios from "axios"
import baseUrl from "../../baseUrl"
import { useParams } from 'react-router-dom';

const GymMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const { id } = useParams()


  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/v1/trainer/assigned-users/${id}`,
        {
          params: {
            page,
            limit,
            search: searchTerm
          }
        }
      );

      setMembers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, searchTerm]);


  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}/${month}/${day}`;
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
                        setPage(1); // reset to first page when searching
                        setSearchTerm(e.target.value);
                      }}
                    />
                  </div>
                  <div className={styles.selectmembers}>
                    <select>
                      <option className={styles.selectoption} value="">Select</option>
                      <option className={styles.selectoption} value="All Members">All Members</option>
                      <option className={styles.selectoption} value="Athlete">Athlete</option>
                      <option className={styles.selectoption} value="Non Athlete">Non Athlete</option>
                      <option className={styles.selectoption} value="Active Members">Active Members</option>
                      <option className={styles.selectoption} value="Inactive Members">Inactive Members</option>
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
                        <th className={styles.tableHeaderCell}>Subscription Status</th>
                        <th className={styles.tableHeaderCell}>Actions</th>
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
                            <div className={styles.statusContainer}>
                              <span className={`${styles.statusBadge} ${member.subscription.status === 'active'
                                ? styles.statusActive
                                : styles.statusExpired
                                }`}>
                                {member.subscription.status}
                              </span>
                              <button className={styles.renewButton}>
                                Renew
                              </button>
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <div className={styles.actionButtons}>
                              <button className={`${styles.actionButton} ${styles.actionButtonEdit}`}>
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className={`${styles.actionButton} ${styles.actionButtonDelete}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className={`${styles.actionButton} ${styles.actionButtonMessage}`}>
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button className={`${styles.actionButton} ${styles.actionButtonView}`}>
                                <Eye className="w-4 h-4" />
                              </button>
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
              /* Add Members Form */
              <div className={styles.formWrapper}>
                <div className={styles.formContainer}>
                  <h2 className={styles.formTitle}>Add Members</h2>

                  <form className={styles.form}>
                    {/* Enter Member Name */}
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

                    {/* Phone Numbers */}
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

                    {/* Address */}
                    <div className={styles.formSection}>
                      <label className={styles.sectionLabel}>Enter Address</label>
                      <textarea
                        rows={3}
                        className={styles.formTextarea}
                        placeholder="Home/Office"
                      ></textarea>
                    </div>

                    {/* Health Note */}
                    <div className={styles.formSection}>
                      <label className={styles.sectionLabel}>Health Note</label>
                      <textarea
                        rows={3}
                        className={styles.formTextarea}
                        placeholder="Enter your health information"
                      ></textarea>
                    </div>

                    {/* Assign Trainers */}
                    <div className={styles.formSection}>
                      <label className={styles.sectionLabel}>Assign Trainers</label>
                      <select className={styles.formSelect}>
                        <option value="">Select Trainer</option>
                        <option value="trainer1">John Smith</option>
                        <option value="trainer2">Sarah Johnson</option>
                        <option value="trainer3">Mike Wilson</option>
                      </select>
                    </div>

                    {/* Billing */}
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
    </div>
  );
};

export default GymMembers;