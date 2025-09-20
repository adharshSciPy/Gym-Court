import React, { useEffect, useState, useRef } from 'react';
import { Search, Edit, Trash2, MessageCircle, Eye, Upload } from 'lucide-react';
import styles from './GymMembers.module.css';
import axios from "axios"
import baseUrl from "../../baseUrl"
import { useParams } from 'react-router-dom';

const GymMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [activeTab, setActiveTab] = useState('members');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [members, setMembers] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [combinedFilter, setCombinedFilter] = useState("");
  const { id } = useParams()

  // File upload refs - one for each member
  const fileInputRefs = useRef({});

  // Fetch members with filters & pagination
  const fetchMembers = async () => {
    try {
      const params = { page, limit, search: searchTerm };
      if (userTypeFilter) params.userType = userTypeFilter;
      if (subscriptionFilter) params.status = subscriptionFilter;

      const res = await axios.get(
        `${baseUrl}/api/v1/trainer/assigned-users/${id}`,
        { params }
      );
      console.log(res)
      setMembers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  // Refetch when page, searchTerm, or userTypeFilter changes
  useEffect(() => {
    fetchMembers();
  }, [page, searchTerm, userTypeFilter, subscriptionFilter]);


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

  // Handle file upload button click
  const handleFileUploadClick = (memberId) => {
    if (fileInputRefs.current[memberId]) {
      fileInputRefs.current[memberId].click();
    }
  };

  // Handle file selection
  const handleFileChange = async (event, member) => {
    const file = event.target.files[0];
    if (!file) return;

    // You can add file validation here
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('memberId', member._id);
      formData.append('memberName', member.name);

      // Replace this with your actual upload endpoint
      // const response = await axios.post(`${baseUrl}/api/v1/upload-member-file`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      // For now, just show a success message
      alert(`File "${file.name}" uploaded successfully for ${member.name}`);
      
      // Reset the input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
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
                    if (value === "athlete" || value === "non-athlete") {
                      setUserTypeFilter(value);
                    } else if (value === "active" || value === "expired") {
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
                          {member.subscription.status === "expired" && (
                            <button className={styles.renewButton}>
                              Renew
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button className={`${styles.actionButton} ${styles.actionButtonMessage}`}
                            onClick={() => openWhatsApp(member.whatsAppNumber, member.name)}
                          >
                            <MessageCircle color='green' className="w-4 h-4" />
                          </button>
                          <button 
                            className={`${styles.actionButton} ${styles.actionButtonUpload}`}
                            onClick={() => handleFileUploadClick(member._id)}
                            title={`Upload file for ${member.name}`}
                          >
                            <Upload color='blue' className="w-4 h-4" />
                          </button>
                          <input
                            ref={el => fileInputRefs.current[member._id] = el}
                            type="file"
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                            onChange={(e) => handleFileChange(e, member)}
                          />
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default GymMembers;