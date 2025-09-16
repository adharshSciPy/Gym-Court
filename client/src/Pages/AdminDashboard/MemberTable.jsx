import React, { useState } from 'react';
import { Search, Edit, Trash2, MessageCircle, Phone, Eye } from 'lucide-react';
import styles from './MemberTable.module.css';

const MemberTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const members = [
    {
      name: "Ethan Harper",
      phone: "555-123-4567",
      whatsapp: "555-987-6543",
      bookingDate: "2024-07-15",
      endedDate: "2024-08-15",
      bookingSlots: "10:00 AM - 11:00 AM",
      status: "Expired"
    },
    {
      name: "Olivia Bennett",
      phone: "555-234-5678",
      whatsapp: "555-876-5432",
      bookingDate: "2024-07-20",
      endedDate: "2024-08-20",
      bookingSlots: "09:00 AM - 10:00 AM",
      status: "Active"
    },
    {
      name: "Noah Carter",
      phone: "555-345-6789",
      whatsapp: "555-765-4321",
      bookingDate: "2024-07-25",
      endedDate: "2024-08-25",
      bookingSlots: "08:00 AM - 09:00 AM",
      status: "Expired"
    },
    {
      name: "Ava Davis",
      phone: "555-456-7890",
      whatsapp: "555-654-3210",
      bookingDate: "2024-07-30",
      endedDate: "2024-08-30",
      bookingSlots: "07:00 AM - 08:00 AM",
      status: "Active"
    },
    {
      name: "Liam Evans",
      phone: "555-567-8901",
      whatsapp: "555-543-2109",
      bookingDate: "2024-08-05",
      endedDate: "2024-09-05",
      bookingSlots: "06:00 AM - 07:00 AM",
      status: "Expired"
    },
    {
      name: "Sophia Foster",
      phone: "555-678-9012",
      whatsapp: "555-432-1098",
      bookingDate: "2024-08-10",
      endedDate: "2024-09-10",
      bookingSlots: "05:00 AM - 06:00 AM",
      status: "Expired"
    },
    {
      name: "Jackson Green",
      phone: "555-789-0123",
      whatsapp: "555-321-0987",
      bookingDate: "2024-08-15",
      endedDate: "2024-09-15",
      bookingSlots: "04:00 AM - 05:00 AM",
      status: "Expired"
    },
    {
      name: "Isabella Hayes",
      phone: "555-890-1234",
      whatsapp: "555-210-9876",
      bookingDate: "2024-08-20",
      endedDate: "2024-09-20",
      bookingSlots: "03:00 AM - 04:00 AM",
      status: "Expired"
    },
    {
      name: "Aiden Ingram",
      phone: "555-901-2345",
      whatsapp: "555-109-8765",
      bookingDate: "2024-08-25",
      endedDate: "2024-09-25",
      bookingSlots: "02:00 AM - 03:00 AM",
      status: "Expired"
    },
    {
      name: "Mia Jenkins",
      phone: "555-012-3456",
      whatsapp: "555-098-7654",
      bookingDate: "2024-08-30",
      endedDate: "2024-09-30",
      bookingSlots: "01:00 AM - 02:00 AM",
      status: "Expired"
    }
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    member.whatsapp.includes(searchTerm)
  );

  const handleRenew = (memberName) => {
    alert(`Renew subscription for ${memberName}`);
  };

  const handleEdit = (memberName) => {
    alert(`Edit ${memberName}`);
  };

  const handleDelete = (memberName) => {
    alert(`Delete ${memberName}`);
  };

  const handleWhatsApp = (memberName) => {
    alert(`Open WhatsApp for ${memberName}`);
  };

  const handleCall = (memberName) => {
    alert(`Call ${memberName}`);
  };

  const handleView = (memberName) => {
    alert(`View details for ${memberName}`);
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

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
              <th className={styles.th}>Subscription Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <tr key={index} className={styles.bodyRow}>
                <td className={styles.td}>{member.name}</td>
                <td className={styles.td}>{member.phone}</td>
                <td className={styles.td}>{member.whatsapp}</td>
                <td className={styles.td}>{member.bookingDate}</td>
                <td className={styles.td}>{member.endedDate}</td>
                <td className={styles.td}>{member.bookingSlots}</td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${member.status === 'Active' ? styles.statusActive : styles.statusExpired}`}>
                    {member.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.renewButton}
                      onClick={() => handleRenew(member.name)}
                    >
                      Renew
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEdit(member.name)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(member.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.whatsappButton}`}
                      onClick={() => handleWhatsApp(member.name)}
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.callButton}`}
                      onClick={() => handleCall(member.name)}
                    >
                      <Phone size={16} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleView(member.name)}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;