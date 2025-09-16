import Booking from "../model/bookingSchema.js";
const getLatestBookings = async (req, res) => {
  try {
    const latestBookings = await Booking.aggregate([
      { $sort: { startDate: -1, startTime: -1, createdAt: -1 } },
      { $group: { _id: "$userId", latestBooking: { $first: "$$ROOT" } } },
      {
        $lookup: {
          from: "users",
          localField: "latestBooking.userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
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
          isMultiDay:"$latestBooking.isMultiDay",
          status:"$latestBooking.status",
        }
      }
    ]);

    // Format time in IST like bookedSlots API
    const formattedBookings = latestBookings.map(b => {
      const startIST = new Date(b.startTime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

      const endIST = new Date(b.endTime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

      return {
        ...b,
        startTime: startIST,
        endTime: endIST,
        startDate: new Date(b.startDate).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }),
        endDate: new Date(b.endDate).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }),
      };
    });

    return res.status(200).json({
      message: "Latest booking for all users",
      count: formattedBookings.length,
      data: formattedBookings
    });
  } catch (err) {
    console.error("Error fetching latest bookings:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export{getLatestBookings}