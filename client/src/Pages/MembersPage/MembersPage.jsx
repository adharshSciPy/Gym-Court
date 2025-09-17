import React, { useEffect, useState } from "react";
import { Search} from "lucide-react";
import styles from "./MembersPage.module.css";
import axios from "axios"
import baseUrl from "../../baseUrl";
function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [members,setMembers]=useState([])
  
 
  
  //   const handleRenew = (memberName) => {
  //     alert(`Renew subscription for ${memberName}`);
  //   };
  
  //   const handleEdit = (memberName) => {
  //     alert(`Edit ${memberName}`);
  //   };
  
    // const handleDelete = (memberName) => {
    //   alert(`Delete ${memberName}`);
    // };
  
    // const handleWhatsApp = (memberName) => {
    //   alert(`Open WhatsApp for ${memberName}`);
    // };
  
  //   const handleCall = (memberName) => {
  //     alert(`Call ${memberName}`);
  //   };
  
    // const handleView = (memberName) => {
    //   alert(`View details for ${memberName}`);
    // };
  useEffect(()=>{
    getMembers()
  },[])
    const getMembers=async () => {
      try {
        const res= await axios.get(`${baseUrl}/api/v1/bookings/latest-booking`)
        console.log(res);
        setMembers(res.data.data)
      } catch (error) {
        console.log(error);
        
      }
    }


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
              <th className={styles.th}>Subscription </th>
              {/* <th className={styles.th}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={index} className={styles.bodyRow}>
                <td className={styles.td}>{member.firstName}</td>
                <td className={styles.td}>{member.phoneNumber}</td>
                <td className={styles.td}>{member.whatsAppNumber}</td>
                <td className={styles.td}>{member.startDate}</td>
                <td className={styles.td}>{member.endDate}</td>
                <td className={styles.td}>{member.courtName}</td>
                <td className={styles.td}>
                  <span
                    className={`${styles.status} ${
                      member.status === "Active"
                        ? styles.statusActive
                        : styles.statusExpired
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                {/* <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEdit(member.name)}
                    >
                      <Edit size={16} />
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
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(member.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                    {member.status === "Expired" && (
                      <button className={styles.renewButton}>Renew</button>
                    )}
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MembersPage