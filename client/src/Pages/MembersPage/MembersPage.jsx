import React, { useEffect, useState } from "react";
import { Search, X, Edit, MessageCircle, Phone, Eye, Trash2 } from "lucide-react";
import styles from "./MembersPage.module.css";
import axios from "axios";
import baseUrl from "../../baseUrl";

function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [showRenewalPopup, setShowRenewalPopup] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [courts, setCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);
  const [slot, setSlotid] = useState(null);

  const [renewalData, setRenewalData] = useState({
    courtId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    amount: "",
    isGst: false,
    gstValue: "",
    gstNumber: "",
    modeOfPayment: "cash",
  });

  // Fetch members on component mount
  useEffect(() => {
    getMembers();
  }, []);

  // Fetch all members/bookings
  const getMembers = async () => {
    setLoadingMembers(true);
    setError(null);
    try {
      const res = await axios.get(`${baseUrl}/api/v1/bookings/latest-booking`);
      setMembers(res.data.data || []);
      console.log(res);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to load members. Please try again.");
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch courts for the renewal popup
  const fetchCourts = async () => {
    setLoadingCourts(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}/api/v1/Court/fetchCourts`);
      console.log(response);
      
      setCourts(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching courts:", error);
      setError("Failed to load courts. Please try again.");
    } finally {
      setLoadingCourts(false);
    }
  };

  // Handle input changes in the renewal form
  const handleRenewalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRenewalData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission for renewal
  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic form validation
    if (
      !renewalData.courtId ||
      !renewalData.startDate ||
      !renewalData.endDate ||
      !renewalData.startTime ||
      !renewalData.endTime ||
      !renewalData.amount ||
      !renewalData.modeOfPayment
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (renewalData.isGst && (!renewalData.gstValue || !renewalData.gstNumber)) {
      setError("GST value and number are required when GST is enabled.");
      return;
    }

    try {
      const renewalPayload = {
        ...renewalData,
        memberId: selectedMember?._id || "",
        userId: selectedMember?.user?._id || "",
      };

      // Remove GST fields if GST is not applicable
      if (!renewalData.isGst) {
        delete renewalPayload.gstValue;
        delete renewalPayload.gstNumber;
      }

      const response = await axios.post(
        `${baseUrl}/api/v1/slot/renew/${slot}`,
        renewalPayload
      );
      console.log(response);
      
      alert("Renewal successful!");
      setShowRenewalPopup(false);
      getMembers(); // Refresh member list
    } catch (error) {
      console.error("Renewal error:", error);
      setError("Renewal failed. Please try again.");
    }
  };

  // Close renewal popup and reset form
  const closeRenewalPopup = () => {
    setShowRenewalPopup(false);
    setSelectedMember(null);
    setCourts([]);
    setRenewalData({
      courtId: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      amount: "",
      isGst: false,
      gstValue: "",
      gstNumber: "",
      modeOfPayment: "cash",
    });
    setError(null);
  };

  // Handle renew button click
  const handleRenew = async (member) => {
    
    
    setSelectedMember(member);
    setSlotid(member.bookingId || "");
    setRenewalData({
      courtId: member.courtId || "",
      startDate: member.startDate || "",
      endDate: member.endDate || "",
      startTime: member.startTime || "",
      endTime: member.endTime || "",
      amount: member.amount || "",
      isGst: member.isGst || false,
      gstValue: member.gstValue || "",
      gstNumber: member.gstNumber || "",
      modeOfPayment: member.modeOfPayment || "cash",
    });

    await fetchCourts ();
    setShowRenewalPopup(true);
  };
console.log(selectedMember);

  // Action button handlers (placeholder implementations)
  const handleEdit = (member) => {
    alert(`Edit member: ${member.firstName}`);
    // Add your edit logic here (e.g., open an edit form)
  };

  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.firstName}?`)) {
      try {
        // Example delete API call
        await axios.delete(`${baseUrl}/api/v1/bookings/${member._id}`);
        alert("Member deleted successfully!");
        getMembers(); // Refresh member list
      } catch (error) {
        console.error("Delete error:", error);
        setError("Failed to delete member. Please try again.");
      }
    }
  };

  const handleWhatsApp = (member) => {
    const phone = member.whatsAppNumber || member.phoneNumber;
    if (phone) {
      window.open(`https://wa.me/${phone}`, "_blank");
    } else {
      alert("No WhatsApp number available.");
    }
  };

  const handleCall = (member) => {
    const phone = member.phoneNumber;
    if (phone) {
      window.open(`tel:${phone}`);
    } else {
      alert("No phone number available.");
    }
  };

  const handleView = (member) => {
    alert(`View details for ${member.firstName}`);
    // Add your view logic here (e.g., open a details modal)
  };

  // Filter members based on search term
  const filteredMembers = members.filter(
    (member) =>
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber?.includes(searchTerm) ||
      member.whatsAppNumber?.includes(searchTerm)
  );

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search members by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            aria-label="Search members"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Members Table */}
      <div className={styles.tableWrapper}>
        {loadingMembers ? (
          <div>Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div>No members found.</div>
        ) : (
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
              {filteredMembers.map((member, index) => (
                <tr key={member._id || index} className={styles.bodyRow}>
                  <td className={styles.td}>{member.firstName || "N/A"}</td>
                  <td className={styles.td}>{member.phoneNumber || "N/A"}</td>
                  <td className={styles.td}>{member.whatsAppNumber || "N/A"}</td>
                  <td className={styles.td}>{member.startDate || "N/A"}</td>
                  <td className={styles.td}>{member.endDate || "N/A"}</td>
                  <td className={styles.td}>{member.courtName || "N/A"}</td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.status} ${
                        member.status === "upcoming"
                          ? styles.statusActive
                          : styles.statusExpired
                      }`}
                    >
                      {member.status || "N/A"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleEdit(member)}
                        title="Edit member"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.whatsappButton}`}
                        onClick={() => handleWhatsApp(member)}
                        title="Send WhatsApp message"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.callButton}`}
                        onClick={() => handleCall(member)}
                        title="Call member"
                      >
                        <Phone size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleView(member)}
                        title="View member details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(member)}
                        title="Delete member"
                      >
                        <Trash2 size={16} />
                      </button>
                      {member.status === "expired" && (
                        <button
                          className={styles.renewButton}
                          onClick={() => handleRenew(member)}
                        >
                          Renew
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Renewal Popup */}
      {showRenewalPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Renew Booking for {selectedMember?.firstName || "Member"}</h2>
              <button
                className={styles.closeButton}
                onClick={closeRenewalPopup}
                aria-label="Close renewal popup"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRenewalSubmit} className={styles.renewalForm}>
              <div className={styles.formGrid}>
                {/* Court Dropdown */}
                <div className={styles.formGroup}>
                  <label htmlFor="courtId">Select Court</label>
                  <select
                    id="courtId"
                    name="courtId"
                    value={renewalData.courtId}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    required
                    disabled={loadingCourts}
                  >
                    <option value="">
                      {loadingCourts ? "Loading courts..." : "Select a court"}
                    </option>
                    {courts.map((court) => (
                      <option
                        key={court._id || court.id}
                        value={court._id || court.id}
                      >
                        {court.name ||
                          court.courtName ||
                          `Court ${court.courtNumber}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className={styles.formGroup}>
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={renewalData.startDate}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* End Date */}
                <div className={styles.formGroup}>
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={renewalData.endDate}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* Start Time */}
                <div className={styles.formGroup}>
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={renewalData.startTime}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* End Time */}
                <div className={styles.formGroup}>
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={renewalData.endTime}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* Amount */}
                <div className={styles.formGroup}>
                  <label htmlFor="amount">Amount</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={renewalData.amount}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* GST Dropdown */}
                <div className={styles.formGroup}>
                  <label htmlFor="gst">GST</label>
                  <select
                    id="gst"
                    name="isGst"
                    value={renewalData.isGst ? "yes" : "no"}
                    onChange={(e) =>
                      setRenewalData((prev) => ({
                        ...prev,
                        isGst: e.target.value === "yes",
                      }))
                    }
                    className={styles.formInput}
                    required
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                {/* GST Value */}
                {renewalData.isGst && (
                  <div className={styles.formGroup}>
                    <label htmlFor="gstValue">GST Value (%)</label>
                    <input
                      type="number"
                      id="gstValue"
                      name="gstValue"
                      value={renewalData.gstValue}
                      onChange={handleRenewalInputChange}
                      className={styles.formInput}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                {/* GST Number */}
                {renewalData.isGst && (
                  <div className={styles.formGroup}>
                    <label htmlFor="gstNumber">GST Number</label>
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={renewalData.gstNumber}
                      onChange={handleRenewalInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                )}

                {/* Mode of Payment */}
                <div className={styles.formGroup}>
                  <label htmlFor="modeOfPayment">Mode of Payment</label>
                  <select
                    id="modeOfPayment"
                    name="modeOfPayment"
                    value={renewalData.modeOfPayment}
                    onChange={handleRenewalInputChange}
                    className={styles.formInput}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Form Error Message */}
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeRenewalPopup}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.renewSubmitButton}>
                  Renew Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersPage;