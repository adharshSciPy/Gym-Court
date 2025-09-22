import React, { useEffect, useState, useRef } from 'react';
import { Search, Edit, Trash2, MessageCircle, Eye, Upload } from 'lucide-react';
import styles from './GymMembers.module.css';
import axios from "axios"
import baseUrl from "../../baseUrl"
import { useParams } from 'react-router-dom';


const GymMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [members, setMembers] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [combinedFilter, setCombinedFilter] = useState("");
  const [uploadingMembers, setUploadingMembers] = useState(new Set());
  const [deletingMembers, setDeletingMembers] = useState(new Set());
  const { id } = useParams()

  // File upload refs - one for each member (specifically for diet PDFs)
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

  // Handle diet plan upload button click
  const handleDietUploadClick = (memberId) => {
    if (fileInputRefs.current[memberId]) {
      fileInputRefs.current[memberId].click();
    }
  };

  // Handle diet plan file selection and upload
  const handleDietFileChange = async (event, member) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - only PDF allowed for diet plans
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file for the diet plan.');
      event.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      event.target.value = '';
      return;
    }

    // Set loading state
    setUploadingMembers(prev => new Set([...prev, member._id]));

    try {
      const formData = new FormData();
      formData.append('dietPdf', file);
      formData.append('userId', member._id);

      // Upload diet plan using the assign-diet-plan endpoint
      const response = await axios.post(
        `${baseUrl}/api/v1/trainer/assign-diet-plan/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert(`Diet plan uploaded successfully for ${member.name}`);
      
      // Optionally refresh members data to show updated info
      await fetchMembers();
      
    } catch (error) {
      console.error('Error uploading diet plan:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid request. Please check your inputs.');
      } else if (error.response?.status === 403) {
        alert('You are not authorized to assign diet plans to this member.');
      } else if (error.response?.status === 404) {
        alert('Member not found or trainer not found.');
      } else {
        alert('Failed to upload diet plan. Please try again.');
      }
    } finally {
      // Reset loading state and clear input
      setUploadingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(member._id);
        return newSet;
      });
      event.target.value = '';
    }
  };

  // Handle diet plan preview
const handlePreviewDietPlan = async (member) => {
  console.log("Member data:", member);

  if (!member.dietPdf) {
    alert('No diet plan available for this member.');
    return;
  }

  try {
    // Construct the full URL to the PDF file
    const pdfUrl = `http://localhost:8000/${member.dietPdf}`;
    
    console.log("PDF URL:", pdfUrl);
    
    const newWindow = window.open(pdfUrl, '_blank');
    
    // Handle case where popup was blocked
    if (!newWindow) {
      alert('Please allow popups for this site to view the PDF.');
    }
    
  } catch (error) {
    console.error('Error opening PDF:', error);
    alert('Error opening diet plan. Please try again.');
  }
};

// Alternative version that downloads the PDF if opening fails
const handlePreviewDietPlanWithFallback = async (member) => {
  console.log("Member data:", member);

  if (!member.dietPdf) {
    alert('No diet plan available for this member.');
    return;
  }

  try {
    let blob;
    
    if (typeof member.dietPdf === 'string') {
      const base64Data = member.dietPdf.replace(/^data:application\/pdf;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      blob = new Blob([bytes], { type: 'application/pdf' });
    } else {
      blob = new Blob([member.dietPdf], { type: 'application/pdf' });
    }

    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      // Fallback: download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `diet-plan-${member.name || 'member'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
  } catch (error) {
    console.error('Error with PDF:', error);
    alert('Error processing diet plan. Please try again.');
  }
};
  // Handle diet plan deletion
  const handleDeleteDietPlan = async (member) => {
    if (!member.dietPdf) {
      alert('No diet plan to delete for this member.');
      return;
    } 

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the diet plan for ${member.name}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    // Set loading state
    setDeletingMembers(prev => new Set([...prev, member._id]));

    try {
      const response = await axios.delete(
        `${baseUrl}/api/v1/trainer/delete-diet-plan/${id}`,
        {
          data: { userId: member._id },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // If you use auth tokens
          }
        }
      );

      alert(`Diet plan deleted successfully for ${member.name}`);
      
      // Refresh members data to show updated info
      await fetchMembers();

    } catch (error) {
      console.error('Error deleting diet plan:', error);
      
      if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid request.');
      } else if (error.response?.status === 403) {
        alert('You are not authorized to delete this diet plan.');
      } else if (error.response?.status === 404) {
        alert('Diet plan not found or member not found.');
      } else {
        alert('Failed to delete diet plan. Please try again.');
      }
    } finally {
      // Reset loading state
      setDeletingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(member._id);
        return newSet;
      });
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
                    <th className={styles.tableHeaderCell}>Diet Plan</th>
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
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.dietPlanStatus}>
                          {member.dietPdf ? (
                            <div className={styles.dietPlanAssigned}>
                              <span className={styles.dietPlanBadge}>Assigned</span>
                            </div>
                          ) : (
                            <span className={styles.noDietPlan}>Not Assigned</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          {/* WhatsApp Message Button */}
                          <button 
                            className={`${styles.actionButton} ${styles.actionButtonMessage}`}
                            onClick={() => openWhatsApp(member.whatsAppNumber, member.name)}
                            title={`Message ${member.name} on WhatsApp`}
                          >
                            <MessageCircle color='green' className="w-4 h-4" />
                          </button>
                          
                          {/* Upload Diet Plan Button */}
                          <button 
                            className={`${styles.actionButton} ${styles.actionButtonUpload}`}
                            onClick={() => handleDietUploadClick(member._id)}
                            title={member.dietPdf ? `Replace diet plan for ${member.name}` : `Upload diet plan for ${member.name}`}
                            disabled={uploadingMembers.has(member._id)}
                          >
                            {uploadingMembers.has(member._id) ? (
                              <div className={styles.uploadingSpinner}></div>
                            ) : (
                              <Upload color='blue' className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* Preview Diet Plan Button - Only show if PDF exists */}
                          {member.dietPdf && (
                            <button 
                              className={`${styles.actionButton} ${styles.actionButtonPreview}`}
                              onClick={() => handlePreviewDietPlan(member)}
                              title={`Preview diet plan for ${member.name}`}
                            >
                              <Eye color='orange' className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Diet Plan Button - Only show if PDF exists */}
                          {member.dietPdf && (
                            <button 
                              className={`${styles.actionButton} ${styles.actionButtonDelete}`}
                              onClick={() => handleDeleteDietPlan(member)}
                              title={`Delete diet plan for ${member.name}`}
                              disabled={deletingMembers.has(member._id)}
                            >
                              {deletingMembers.has(member._id) ? (
                                <div className={styles.deletingSpinner}></div>
                              ) : (
                                <Trash2 color='red' className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          {/* Hidden file input for PDF upload */}
                          <input
                            ref={el => fileInputRefs.current[member._id] = el}
                            type="file"
                            style={{ display: 'none' }}
                            accept=".pdf"
                            onChange={(e) => handleDietFileChange(e, member)}
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