import Booking from "../model/bookingSchema.js";
import Slot from "../model/slotSchema.js";
import { User } from "../model/userSchema.js";
import Court from "../model/courtSchema.js";
import mongoose from "mongoose";
const getLatestBookings = async (req, res) => {
  try {
    const {
      search,     
      startDate,  
      endDate,      
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

   
    const matchConditions = {};

   
    if (startDate || endDate) {
  matchConditions.startDate = {};

  if (startDate) {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    matchConditions.startDate.$gte = startOfDay;
  }

  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    matchConditions.startDate.$lte = endOfDay;
  }
}
    const pipeline = [
      { $match: matchConditions },

      { $sort: { startDate: -1, startTime: -1, createdAt: -1 } },
      { $group: { _id: "$userId", latestBooking: { $first: "$$ROOT" } } },

      {
        $lookup: {
          from: "users",
          localField: "latestBooking.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.phoneNumber": { $regex: search, $options: "i" } },
                  { "user.firstName": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Join Court
      {
        $lookup: {
          from: "courts",
          localField: "latestBooking.courtId",
          foreignField: "_id",
          as: "court",
        },
      },
      { $unwind: "$court" },

      {
        $project: {
          bookingId: "$latestBooking._id",
          userId: "$user._id",
          firstName: "$user.firstName",
          lastName: "$user.lastName",
          phoneNumber: "$user.phoneNumber",
          whatsAppNumber: "$user.whatsAppNumber",
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
        },
      },

      // Pagination
      { $skip: skip },
      { $limit: limitNum },
    ];

    // Run pipeline
    const latestBookings = await Booking.aggregate(pipeline);

    // Total count for pagination
    const totalCountPipeline = [
      { $match: matchConditions },
      { $group: { _id: "$userId", latestBooking: { $first: "$$ROOT" } } },
      {
        $lookup: {
          from: "users",
          localField: "latestBooking.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.phoneNumber": { $regex: search, $options: "i" } },
                  { "user.firstName": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ];

    const totalDocs = await Booking.aggregate(totalCountPipeline);
    const total = totalDocs.length > 0 ? totalDocs[0].total : 0;

    // Format date & time properly
    const formattedBookings = latestBookings.map((b) => {
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
        ...b,
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
      message: "Latest bookings fetched successfully",
      count: formattedBookings.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: formattedBookings,
    });
  } catch (err) {
    console.error("Error fetching latest bookings:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getFullBookingHistory = async (req, res) => {
  try {
    const { courtId, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const now = new Date();
    const query = {};

    // --- Court filter ---
    if (courtId) {
      if (!mongoose.Types.ObjectId.isValid(courtId)) {
        return res.status(400).json({ message: "Invalid courtId" });
      }
      query.courtId = courtId;
    }

    // --- Status filter ---
    if (status && status !== "all") {
      const statuses = status.split(",").map((s) => s.trim());
      const statusConditions = [];

      for (let s of statuses) {
        switch (s) {
          case "cancelled":
            statusConditions.push({ status: "cancelled" });
            break;
          case "upcoming":
            statusConditions.push({ startDate: { $gt: now }, status: { $ne: "cancelled" } });
            break;
          case "active":
            statusConditions.push({
              startDate: { $lte: now },
              endDate: { $gte: now },
              status: { $ne: "cancelled" },
            });
            break;
          case "expired":
            statusConditions.push({ endDate: { $lt: now }, status: { $ne: "cancelled" } });
            break;
        }
      }

      if (statusConditions.length) {
        query.$or = statusConditions;
      }
    }

    // --- Date filter ---
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.endDate = { ...query.endDate, $gte: start }; // bookings ending after startDate
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.startDate = { ...query.startDate, $lte: end }; // bookings starting before endDate
    }

    // --- Pagination ---
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // --- Fetch bookings & counts ---
    const [bookings, totalCount, cancelledCount, bookedCount] = await Promise.all([
      Booking.find(query)
        .populate("userId", "firstName lastName phoneNumber whatsAppNumber email")
        .populate("courtId", "courtName surface totalSlots")
        .populate("slotIds", "date startTime endTime isBooked")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Booking.countDocuments(query),
      Booking.countDocuments({ ...query, status: "cancelled" }),
      Booking.countDocuments({ ...query, status: { $ne: "cancelled" } }),
    ]);

    // --- Formatting helpers ---
    const formatTime = (date) =>
      date
        ? new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
        : null;

    const formatDate = (date) =>
      date
        ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" })
        : null;

    const formattedBookings = bookings.map((b) => ({
      ...b.toObject(),
      startDate: formatDate(b.startDate),
      endDate: formatDate(b.endDate),
      startTime: formatTime(b.startTime),
      endTime: formatTime(b.endTime),
      slotIds: b.slotIds.map((s) => ({
        ...s.toObject(),
        startTime: formatTime(s.startTime),
        endTime: formatTime(s.endTime),
      })),
    }));

    res.status(200).json({
      message: "Booking history fetched successfully",
      totalCount,
      cancelledCount,
      bookedCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching booking history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






export{getLatestBookings,getFullBookingHistory}