import Booking from "../model/bookingSchema.js";
const getLatestBookings = async (req, res) => {
  try {
    const latestBookings = await Booking.aggregate([
      { $sort: { startDate: -1, startTime: -1, createdAt: -1 } },
      { $group: { _id: "$userId", latestBooking: { $first: "$$ROOT" } } },

      // Join User
      {
        $lookup: {
          from: "users",
          localField: "latestBooking.userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // Join Court
      {
        $lookup: {
          from: "courts",
          localField: "latestBooking.courtId",
          foreignField: "_id",
          as: "court"
        }
      },
      { $unwind: "$court" },

      {
        $project: {
          bookingId: "$latestBooking._id",
          userId: "$user._id",
          firstName: "$user.firstName",
          lastName: "$user.lastName",
          phoneNumber: "$user.phoneNumber",
          courtName: "$court.courtName",
          startDate: "$latestBooking.startDate",
          endDate: "$latestBooking.endDate",
          startTime: "$latestBooking.startTime",
          endTime: "$latestBooking.endTime",
          notes: "$latestBooking.notes",
          isMultiDay: "$latestBooking.isMultiDay",
          status: "$latestBooking.status",
          amount: "$latestBooking.amount",
          modeOfPayment: "$latestBooking.modeOfPayment",
          isGst: "$latestBooking.isGst",
          gst: "$latestBooking.gst",
          gstNumber: "$latestBooking.gstNumber",
        }
      }
    ]);

    // Format date & time properly
    const formattedBookings = latestBookings.map(b => {
      const startIST = b.startTime
        ? new Date(b.startTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        : null;

      const endIST = b.endTime
        ? new Date(b.endTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        : null;

      return {
        bookingId: b.bookingId,
        userId: b.userId,
        firstName: b.firstName,
        lastName: b.lastName,
        phoneNumber: b.phoneNumber,
        courtName: b.courtName,
        notes: b.notes || "",
        status: b.status || "confirmed",
        isMultiDay: b.isMultiDay || false,
        amount: b.amount,
        modeOfPayment: b.modeOfPayment,
        isGst: b.isGst,
        gst: b.gst,
        gstNumber: b.gstNumber,
        startDate: b.startDate
          ? new Date(b.startDate).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })
          : null,
        endDate: b.endDate
          ? new Date(b.endDate).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })
          : null,
        startTime: startIST,
        endTime: endIST,
      };
    });

    return res.status(200).json({
      message: "Latest booking for all users",
      count: formattedBookings.length,
      data: formattedBookings,
    });
  } catch (err) {
    console.error("Error fetching latest bookings:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export{getLatestBookings}