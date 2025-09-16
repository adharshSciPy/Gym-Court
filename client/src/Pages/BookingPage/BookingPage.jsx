
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './BookingManagement.css';

const BookingManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState('Court 1');

  // Mock data with custom time slots - replace with actual API call
  const mockBookings = [
    { id: 1, courtName: 'Court 1', playerName: 'Ava Davis', startTime: '07:00', endTime: '08:00', date: '2025-09-16' },
    { id: 2, courtName: 'Court 1', playerName: 'Olivia Bennet', startTime: '08:15', endTime: '08:45', date: '2025-09-16' }, // 30 min slot
    { id: 3, courtName: 'Court 1', playerName: 'John Smith', startTime: '09:20', endTime: '09:30', date: '2025-09-16' }, // 10 min slot
    { id: 4, courtName: 'Court 1', playerName: 'Sarah Wilson', startTime: '10:00', endTime: '11:30', date: '2025-09-16' }, // 1.5 hour slot
    { id: 5, courtName: 'Court 1', playerName: 'Mike Johnson', startTime: '14:00', endTime: '14:20', date: '2025-09-16' }, // 20 min slot
    { id: 6, courtName: 'Court 1', playerName: 'Emma Brown', startTime: '15:30', endTime: '16:45', date: '2025-09-16' }, // 1 hour 15 min
    { id: 7, courtName: 'Court 1', playerName: 'David Miller', startTime: '17:10', endTime: '17:25', date: '2025-09-16' }, // 15 min slot
    { id: 8, courtName: 'Court 1', playerName: 'Lisa Garcia', startTime: '18:00', endTime: '19:00', date: '2025-09-16' },
    { id: 9, courtName: 'Court 2', playerName: 'James Taylor', startTime: '07:30', endTime: '08:00', date: '2025-09-16' }, // 30 min
    { id: 10, courtName: 'Court 2', playerName: 'Anna White', startTime: '09:00', endTime: '09:25', date: '2025-09-16' }, // 25 min
    { id: 11, courtName: 'Court 2', playerName: 'Chris Lee', startTime: '13:15', endTime: '14:30', date: '2025-09-16' }, // 1 hour 15 min
    { id: 12, courtName: 'Court 3', playerName: 'Maria Rodriguez', startTime: '08:45', endTime: '09:00', date: '2025-09-16' }, // 15 min
    { id: 13, courtName: 'Court 3', playerName: 'Alex Johnson', startTime: '16:20', endTime: '16:30', date: '2025-09-16' }, // 10 min
  ];

  const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4'];

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    if (duration < 60) {
      return `${duration} min`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const changeMonth = (months) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  // Filter bookings for selected date and court
  const filteredBookings = mockBookings.filter(booking => 
    booking.date === formatDate(selectedDate) && 
    booking.courtName === selectedCourt
  );

  return (
    <div className="bookingPageWrapper">
      <div className="bookingPageHeader">
        <h1 className="courtlyMainTitle">Courtly</h1>
        <h2 className="selectedCourtTitle">{selectedCourt}</h2>
      </div>

      <div className="bookingTabsWrapper">
        <div className="bookingTabsList">
          <button className="bookingTab">Members</button>
          <button className="bookingTab">Book Now</button>
          <button className="bookingTab bookingTabActive">Booking Overview</button>
          <button className="bookingTab">Payment history</button>
          <button className="bookingTab">Reports</button>
          <button className="bookingTab">Bills</button>
        </div>
      </div>

      <div className="bookingControlsSection">
        <div className="bookingDateControls">
          <button className="bookingMonthNavButton" onClick={() => changeMonth(-1)} title="Previous Month">
            <ChevronLeft size={16} />
            <ChevronLeft size={16} style={{marginLeft: '-8px'}} />
          </button>
          
          <button className="bookingDateNavButton" onClick={() => changeDate(-1)} title="Previous Day">
            <ChevronLeft size={20} />
          </button>
          
          <div className="bookingDatePickerWrapper">
            <Calendar size={20} className="bookingCalendarIcon" />
            <input
              type="date"
              value={formatDate(selectedDate)}
              onChange={handleDateChange}
              className="bookingDateInput"
            />
            <span className="bookingDateDisplayText">{formatDisplayDate(selectedDate)}</span>
          </div>
          
          <button className="bookingDateNavButton" onClick={() => changeDate(1)} title="Next Day">
            <ChevronRight size={20} />
          </button>

          <button className="bookingMonthNavButton" onClick={() => changeMonth(1)} title="Next Month">
            <ChevronRight size={16} />
            <ChevronRight size={16} style={{marginLeft: '-8px'}} />
          </button>

          <button className="bookingTodayButton" onClick={goToToday}>
            Today
          </button>
        </div>

        <div className="bookingCourtSelectorWrapper">
          <select 
            value={selectedCourt} 
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="bookingCourtSelectDropdown"
          >
            {courts.map(court => (
              <option key={court} value={court}>{court}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bookingSlotsGrid">
        {filteredBookings.length === 0 ? (
          <div className="noBookingsMessage">
            <div className="noBookingsIcon">📅</div>
            <h3>No bookings for this date</h3>
            <p>Select a different date or court to view bookings</p>
          </div>
        ) : (
          filteredBookings
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((booking) => (
              <div key={booking.id} className="bookingSlot booked">
                <div className="bookingInfo">
                  <div className="playerName">{booking.playerName}</div>
                  <div className="timeRange">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </div>
                  <div className="duration">
                    {calculateDuration(booking.startTime, booking.endTime)}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BookingManagement;