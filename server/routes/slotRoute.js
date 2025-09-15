import express from "express";
import { bookedSlots, bookSlot, cancelBooking, getAvailableSlots } from "../controller/slotController.js";

const slotRouter = express.Router();

slotRouter.post("/book", bookSlot);
slotRouter.get("/booked/:id", bookedSlots);//{id:courtId}
slotRouter.post("/cancel/:id", cancelBooking);
slotRouter.get("/available/:courtId", getAvailableSlots);

export default slotRouter;
