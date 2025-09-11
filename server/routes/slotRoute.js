import express from "express";
import { bookSlot, cancelBooking, getAvailableSlots } from "../controller/slotController.js";

const slotRouter = express.Router();

slotRouter.post("/slots/book/:id", bookSlot);
slotRouter.post("/slots/cancel/:id", cancelBooking);
slotRouter.get("/slots/available/:courtId", getAvailableSlots);

export default slotRouter;
