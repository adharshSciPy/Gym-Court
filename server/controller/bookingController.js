import Booking from "../model/bookingSchema.js";
import Slot from "../model/slotSchema.js";
import { User } from "../model/userSchema.js";
import Court from "../model/courtSchema.js";
import mongoose from "mongoose";
const getLatestBookings = async (req, res) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const matchConditions = {};

    // --- Date filter ---
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      start.setHours(0, 0, 0, 0);

      const end = endDate ? new Date(endDate) : new Date("2100-01-01");
      end.setHours(23, 59, 59, 999);

      matchConditions.startDate = { $lte: end };
      matchConditions.endDate = { $gte: start };
    }

    // --- Aggregation pipeline ---
    const pipeline = [
      { $match: matchConditions },

      // Sort by newest first
      { $sort: { startDate: -1, startTime: -1, createdAt: -1 } },

      // Group by userId → latest booking per user
      {
        $group: {
          _id: "$userId",
          latestBooking: { $first: "$$ROOT" },
        },
      },

      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "latestBooking.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Lookup court
      {
        $lookup: {
          from: "courts",
          localField: "latestBooking.courtId",
          foreignField: "_id",
          as: "court",
        },
      },
      { $unwind: "$court" },

      // Search filter
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.firstName": { $regex: search, $options: "i" } },
                  { "user.lastName": { $regex: search, $options: "i" } },
                  { "user.phoneNumber": { $regex: search, $options: "i" } },
                  { "user.whatsAppNumber": { $regex: search, $options: "i" } },
                  { "court.courtName": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Project required fields
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

    const latestBookings = await Booking.aggregate(pipeline);

    const now = new Date();

    // --- Format date & time + calculate dynamic status ---
    const formattedBookings = latestBookings.map((b) => {
      let status;
      if (b.startTime && b.endTime) {
        if (now < b.startTime) status = "upcoming";
        else if (now >= b.startTime && now <= b.endTime) status = "active";
        else status = "expired";
      } else {
        status = "upcoming"; // fallback
      }

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
        status, // dynamically calculated
      };
    });

    // --- Total count for pagination ---
    const totalDocs = await Booking.countDocuments(matchConditions);

    return res.status(200).json({
      message: "Latest bookings fetched successfully",
      count: formattedBookings.length,
      total: totalDocs,
      page: pageNum,
      totalPages: Math.ceil(totalDocs / limitNum),
      data: formattedBookings,
    });
  } catch (err) {
    console.error("Error fetching latest bookings:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getFullBookingHistory = async (req, res) => {
  try {
    const { courtId, status, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    const now = new Date();
    const matchConditions = {};

    // --- Court filter ---
    if (courtId) {
      if (!mongoose.Types.ObjectId.isValid(courtId)) {
        return res.status(400).json({ message: "Invalid courtId" });
      }
      matchConditions.courtId = new mongoose.Types.ObjectId(courtId);
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
        matchConditions.$or = statusConditions;
      }
    }

    // --- Date filter ---
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchConditions.endDate = { ...matchConditions.endDate, $gte: start };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchConditions.startDate = { ...matchConditions.startDate, $lte: end };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // --- Aggregation pipeline ---
    const pipeline = [
      { $match: matchConditions },

      // Join user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Search filter
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.firstName": { $regex: search, $options: "i" } },
                  { "user.lastName": { $regex: search, $options: "i" } },
                  { "user.phoneNumber": { $regex: search, $options: "i" } },
                  { "user.whatsAppNumber": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Join court
      {
        $lookup: {
          from: "courts",
          localField: "courtId",
          foreignField: "_id",
          as: "court",
        },
      },
      { $unwind: "$court" },

      // Join slots
      {
        $lookup: {
          from: "slots",
          localField: "slotIds",
          foreignField: "_id",
          as: "slots",
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const bookings = await Booking.aggregate(pipeline);

    // --- Count for pagination ---
    const countPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "userId",
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
                  { "user.firstName": { $regex: search, $options: "i" } },
                  { "user.lastName": { $regex: search, $options: "i" } },
                  { "user.phoneNumber": { $regex: search, $options: "i" } },
                  { "user.whatsAppNumber": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ];

    const totalDocs = await Booking.aggregate(countPipeline);
    const totalCount = totalDocs.length > 0 ? totalDocs[0].total : 0;

    // --- Format date/time ---
    const formatTime = (date) =>
      date
        ? new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        : null;

    const formatDate = (date) =>
      date
        ? new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })
        : null;

    const formattedBookings = bookings.map((b) => ({
      ...b,
      startDate: formatDate(b.startDate),
      endDate: formatDate(b.endDate),
      startTime: formatTime(b.startTime),
      endTime: formatTime(b.endTime),
      slots: b.slots.map((s) => ({
        ...s,
        startTime: formatTime(s.startTime),
        endTime: formatTime(s.endTime),
      })),
    }));

    return res.status(200).json({
      message: "Booking history fetched successfully",
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching booking history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export{getLatestBookings,getFullBookingHistory}