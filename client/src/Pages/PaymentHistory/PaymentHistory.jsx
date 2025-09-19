import React, { useEffect, useState, useCallback } from "react";
import { Search, MessageCircle, File, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./PaymentHistory.module.css";
import baseUrl from "../../baseUrl";
import axios from "axios";

function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [billData, setBillData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [courts, setCourts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounce function for search
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const getAllCourt = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/v1/Court/fetchCourts`);
      if (res.status === 200) {
        setCourts(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching courts:", error);
    }
  };

  const getPaymentHistory = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      if (selectedCourt) {
        params.append('courtId', selectedCourt);
      }
      
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const queryString = params.toString();
      
      const url = `${baseUrl}/api/v1/billings/payment-history${queryString ? `?${queryString}` : ''}`;
      
      
      const res = await axios.get(url);
      
      if (res.status === 200) {
        setBillData(res.data.billings || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalRecords(res.data.totalRecords || 0);
      }
    } catch (error) {
      console.log("Error fetching payment history:", error);
      setBillData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of getPaymentHistory for search
  const debouncedGetPaymentHistory = useCallback(
    debounce(() => {
      getPaymentHistory();
    }, 500),
    [searchTerm, startDate, endDate, selectedCourt, currentPage, itemsPerPage]
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleEndDate = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCourtChange = (e) => {
    setSelectedCourt(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedCourt("");
    setCurrentPage(1);
  };

  // Action handlers
  const handleDelete = (memberId) => {
    alert(`Delete member with ID: ${memberId}`);
  };

  const handleWhatsApp = (memberName) => {
    alert(`Open WhatsApp for ${memberName}`);
  };

  const handleView = (memberId) => {
    alert(`View details for member with ID: ${memberId}`);
  };

  // Load courts on component mount
  useEffect(() => {
    getAllCourt();
  }, []);

  // Fetch payment history when filters change
  useEffect(() => {
    debouncedGetPaymentHistory();
    
    // Cleanup function to cancel debounced calls
    return () => {
      debouncedGetPaymentHistory.cancel?.();
    };
  }, [searchTerm, startDate, endDate, selectedCourt, currentPage]);

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search members"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.dateFilterWrapper}>
          <input
            type="date"
            value={startDate}
            onChange={handleDateChange}
            className={styles.formInput}
            placeholder="Start Date"
          />
          <span style={{ margin: "0 10px" }}>To</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDate}
            className={styles.formInput}
            placeholder="End Date"
          />

          {/* Court Dropdown */}
          <select
            style={{
              padding: "8px",
              borderRadius: "8px",
              marginLeft: "10px",
              border: "none",
            }}
            value={selectedCourt}
            onChange={handleCourtChange}
          >
            <option value="">All Courts</option>
            {courts.map((court) => (
              <option key={court._id} value={court._id}>
                {court.courtName || ""}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          Loading...
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Booking Date</th>
              <th className={styles.th}>Ended Date</th>
              <th className={styles.th}>Payment Method</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billData?.length > 0 ? (
              billData.map((member, index) => (
                <tr key={member._id || index} className={styles.bodyRow}>
                  <td className={styles.td}>
                    {member.userId?.firstName || ""} {member.userId?.lastName || ""}
                  </td>
                  <td className={styles.td}>
                    {member.bookingId?.startDate ? 
                      new Date(member.bookingId.startDate).toLocaleDateString() : 
                      ""
                    }
                  </td>
                  <td className={styles.td}>
                    {member.bookingId?.endDate ? 
                      new Date(member.bookingId.endDate).toLocaleDateString() : 
                      ""
                    }
                  </td>
                  <td className={styles.td}>{member.modeOfPayment || ""}</td>
                  
                  <td className={styles.td}>{member.amount}</td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.whatsappButton}`}
                        onClick={() => handleWhatsApp(member.userId?.firstName)}
                        title="WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleView(member._id)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(member._id)}
                        title="Download Bill"
                      >
                        <File size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  {loading ? "Loading..." : "No records found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalRecords)} of{" "}
            {totalRecords} entries
          </div>
          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationButton} ${
                currentPage === 1 ? styles.disabled : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className={styles.pageNumbers}>
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.activePage : ""
                  } ${page === "..." ? styles.ellipsis : ""}`}
                  onClick={() => page !== "..." && handlePageChange(page)}
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className={`${styles.paginationButton} ${
                currentPage === totalPages ? styles.disabled : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;