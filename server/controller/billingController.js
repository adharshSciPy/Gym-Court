import Billing from "../model/billingSchema.js";
const getBillingsByCourt = async (req, res) => {
  try {
    const { id: courtId } = req.params;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!courtId) {
      return res.status(400).json({ message: "Court ID is required" });
    }

    // --- Pagination values ---
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // --- Build date filter for booking dates ---
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = endOfDay;
    }

    // --- Query billings, filter on booking startDate ---
    const billings = await Billing.find({ courtId })
      .populate({
        path: "bookingId",
        match: startDate || endDate ? { startDate: dateFilter } : {}, // filter on booking
        select:
          "slotIds startDate endDate startTime endTime isMultiDay status notes amount modeOfPayment",
        populate: { path: "slotIds", select: "date startTime endTime" },
      })
      .populate("userId", "firstName lastName phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // --- Remove billings where bookingId got filtered out ---
    const filteredBillings = billings.filter((b) => b.bookingId);

    // --- Total count ---
    const total = await Billing.countDocuments({ courtId });

    // --- Helpers ---
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    // --- Transform ---
    const formattedBillings = filteredBillings.map((billing) => {
      const booking = billing.bookingId;
      return {
        ...billing.toObject(),
        bookingId: {
          ...booking.toObject(),
          startDate: formatDate(booking.startDate),
          endDate: formatDate(booking.endDate),
          startTime: formatTime(booking.startTime),
          endTime: formatTime(booking.endTime),
        },
      };
    });

    res.status(200).json({
      message: "Payment history fetched successfully",
      count: formattedBillings.length,
      total: filteredBillings.length,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      billings: formattedBillings,
    });
  } catch (error) {
    console.error("Error fetching court billings:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



export{getBillingsByCourt}