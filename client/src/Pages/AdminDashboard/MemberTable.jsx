import React, { useEffect, useState } from "react";
import { Search, Trash2, MessageCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./MemberTable.module.css";
import axios from "axios";
import baseUrl from "../../baseUrl";

const MemberTable = (selectedCourtNumber) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(10); // You can make this configurable

  const handleDelete = (memberName) => {
    alert(`Delete ${memberName}`);
  };

  const handleWhatsApp = (memberName) => {
    alert(`Open WhatsApp for ${memberName}`);
  };

  const handleView = (memberName) => {
    alert(`View details for ${memberName}`);
  };

  const fetchBookingHistory = async (page = 1, search ) => {
    setLoading(true);
    try {
      const params = {
        courtId: selectedCourtNumber.selectedCourtNumber,
        page: page,
        limit: itemsPerPage,
      };

      // Add search parameter if it has a value
      if (search.trim()) {
        params.search = parseInt(search); 
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const res = await axios.get(`${baseUrl}/api/v1/bookings/full-booking`, {
        params: params,
      });
      console.log(params);
      
      console.log(res);
      setBookingHistory(res.data.bookings);
      
      // Assuming your backend returns pagination info
      // Adjust these based on your actual API response structure
      setTotalPages(res.data.totalPages || Math.ceil(res.data.total / itemsPerPage));
      setTotalRecords(res.data.total || res.data.bookings.length);
      
    } catch (error) {
      console.log(error);
      setBookingHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    setCurrentPage(1);
  };
const handleEndDate=(e)=>{
  const value = e.target.value;
  setEndDate(value)
    setCurrentPage(1);

}
  // Effect for initial load and court number change
  useEffect(() => {
    if (selectedCourtNumber) {
      setCurrentPage(1);
      fetchBookingHistory(1, searchTerm);
    }
  }, [selectedCourtNumber]);

  // Effect for page change
  useEffect(() => {
    if (selectedCourtNumber) {
      fetchBookingHistory(currentPage, searchTerm);
    }
  }, [currentPage]);

  // Effect for search (with debounce)
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (selectedCourtNumber) {
        fetchBookingHistory(1, searchTerm);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Effect for date change (immediate)
  useEffect(() => {
    if (selectedCourtNumber) {
      fetchBookingHistory(1, searchTerm, startDate,endDate);
    }
  }, [startDate,endDate]);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
            placeholder="Filter by date"
          />
          <span style={{marginLeft:"10px",marginRight:"10px"}}>To</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDate}
            className={styles.formInput}
            placeholder="Filter by date"
          />
        </div>
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>Loading...</div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Phone Number</th>
              <th className={styles.th}>WhatsApp Number</th>
              <th className={styles.th}>Booking Date</th>
              <th className={styles.th}>Ended Date</th>
              <th className={styles.th}>Booking Slots</th>
              <th className={styles.th}>Subscription</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingHistory.length === 0 && !loading ? (
              <tr>
                <td colSpan="8" className={styles.noData}>
                  No bookings found
                </td>
              </tr>
            ) : (
              bookingHistory.map((member, index) => (
                <tr key={member._id || index} className={styles.bodyRow}>
                  <td className={styles.td}>{member.userId?.firstName}</td>
                  <td className={styles.td}>{member.userId?.phoneNumber}</td>
                  <td className={styles.td}>{member.userId?.whatsAppNumber}</td>
                  <td className={styles.td}>{member.startDate}</td>
                  <td className={styles.td}>{member.endDate}</td>
                  <td className={styles.td}>{`${member.startTime}-${member.endTime}`}</td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.status} ${
                        member.status === "upcoming"
                          ? styles.statusActive
                          : styles.statusExpired
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.whatsappButton}`}
                        onClick={() => handleWhatsApp(member.userId?.firstName)}
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleView(member.userId?.firstName)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(member.userId?.firstName)}
                      >
                        <Trash2 size={16} />
                      </button>
                      {member.status === "expired" && (
                        <button className={styles.renewButton}>Renew</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} entries
          </div>
          
          <div className={styles.paginationControls}>
            {/* Previous Button */}
            <button
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className={styles.pageNumbers}>
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.activePage : ''
                  } ${page === '...' ? styles.ellipsis : ''}`}
                  onClick={() => page !== '...' && handlePageChange(page)}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTable;