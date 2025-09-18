import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./report.css";
import "../BookingPage/BookingManagement.module.css"

const ReportPage = () => {
  // Sample booking data
  const data = [
    { month: "Jan", bookings: 400 },
    { month: "Feb", bookings: 300 },
    { month: "Mar", bookings: 450 },
    { month: "Apr", bookings: 320 },
    { month: "May", bookings: 500 },
    { month: "Jun", bookings: 200 },
    { month: "Jul", bookings: 350 },
  ];

  return (
    <div className="reportsPageContainer">
      <div className="reportsCourtHeader">
        <h2>Court 1</h2>
      </div>
       <div className="bookingTabsWrapper">
        <div className="bookingTabsList">
          <button className="bookingTab">Members</button>
          <button className="bookingTab">Book Now</button>
          <button className="bookingTab ">Booking Overview</button>
          <button className="bookingTab">Payment history</button>
          <button className="bookingTab bookingTabActive">Reports</button>
          <button className="bookingTab">Bills</button>
        </div>
      </div>

      {/* Booking Overview */}
      <div className="reportsOverviewSection">
        <h3>Booking Overview</h3>
        <div className="reportsOverviewCards">
          <div className="reportsCard">
            <p>Total Bookings</p>
            <h2>1200</h2>
          </div>
          <div className="reportsCard">
            <p>Completed Bookings</p>
            <h2>1050</h2>
          </div>
          <div className="reportsCard">
            <p>Cancelled Bookings</p>
            <h2>150</h2>
          </div>
        </div>
      </div>

      {/* Booking Trends */}
      <div className="reportsTrendsSection">
        <h3>Booking Trends</h3>
        <p className="reportsMonthly">
          Monthly Bookings <span className="reportsPositive">+15%</span>
        </p>
        <p className="reportsSubtext">
          Last 12 Months <span className="reportsPositive2">+15%</span>
        </p>

        <div className="reportsChartWrapper">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 4, fill: "#059669" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
