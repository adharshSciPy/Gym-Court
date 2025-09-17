import Billing from "../model/billingSchema.js";
const getBillingsByCourt = async (req, res) => {
  try {
    const { id: courtId } = req.params;

    if (!courtId) {
      return res.status(400).json({ message: "Court ID is required" });
    }

    const billings = await Billing.find({ courtId })
      .populate({
        path: "bookingId",
        select: "slotIds startDate endDate startTime endTime isMultiDay status notes amount modeOfPayment",
        populate: { path: "slotIds", select: "date startTime endTime" },
      })
      .populate("userId", "firstName lastName phoneNumber")
      .sort({ createdAt: -1 });

    // --- Helpers for formatting ---
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

    // --- Transform billings with formatted booking details ---
    const formattedBillings = billings.map((billing) => {
      const booking = billing.bookingId;
      return {
        ...billing.toObject(),
        bookingId: booking
          ? {
              ...booking.toObject(),
              startDate: formatDate(booking.startDate),
              endDate: formatDate(booking.endDate),
              startTime: formatTime(booking.startTime),
              endTime: formatTime(booking.endTime),
            }
          : null,
      };
    });

    res.status(200).json({
      message: "Payment history fetched succesfully",
      count: formattedBillings.length,
      billings: formattedBillings,
    });
  } catch (error) {
    console.error("Error fetching court billings:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export{getBillingsByCourt}