
import React, { useEffect, useState } from "react";
import {  MessageCircle, File, Eye } from "lucide-react";
import styles from "./MemberTable.module.css";
import baseUrl from "../../baseUrl";
import axios from "axios";

function PaymentHistory({selectedCourtNumber}) {
  const [billData,setBillData]=useState([])


//   const handleRenew = (memberName) => {
//     alert(`Renew subscription for ${memberName}`);
//   };

//   const handleEdit = (memberName) => {
//     alert(`Edit ${memberName}`);
//   };

  const handleDelete = (memberName) => {
    alert(`Delete ${memberName}`);
  };

  const handleWhatsApp = (memberName) => {
    alert(`Open WhatsApp for ${memberName}`);
  };

//   const handleCall = (memberName) => {
//     alert(`Call ${memberName}`);
//   };

  const handleView = (memberName) => {
    alert(`View details for ${memberName}`);
  };
  useEffect(()=>{
    const getPaymentHistory=async () => {
    try {
      const res=await axios.get(`${baseUrl}/api/v1/billings/court-payment-history/${selectedCourtNumber}`)
      console.log(res);
      setBillData(res.data.billings)
      
    } catch (error) {
      console.log(error);
      
    }
  }
  getPaymentHistory()
  },[selectedCourtNumber])
  return (
    <div className={styles.container}>
      

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Booking Date</th>
              <th className={styles.th}>Ended Date</th>
              <th className={styles.th}>Payment Method</th>
              <th className={styles.th}>Bills</th>
            </tr>
          </thead>
          <tbody>
            {billData?.map((member, index) => (
              <tr key={index} className={styles.bodyRow}>
                <td className={styles.td}>{member.userId?.firstName || ""}</td>
                <td className={styles.td}>{member.bookingId?.startDate || ""}</td>
                <td className={styles.td}>{member.bookingId?.endDate || ""}</td>
                <td className={styles.td}>{member.bookingId?.modeOfPayment || ""}</td>
                
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    {/* <button 
                      className={styles.actionButton}
                      onClick={() => handleEdit(member.name)}
                    >
                      <Edit size={16} />
                    </button> */}

                    <button
                      className={`${styles.actionButton} ${styles.whatsappButton}`}
                      onClick={() => handleWhatsApp(member.name)}
                    >
                      <MessageCircle size={16} />
                    </button>
                    {/* <button 
                      className={`${styles.actionButton} ${styles.callButton}`}
                      onClick={() => handleCall(member.name)}
                    >
                      <Phone size={16} />
                    </button> */}
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
                      <File size={16} />
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
}

export default PaymentHistory;
