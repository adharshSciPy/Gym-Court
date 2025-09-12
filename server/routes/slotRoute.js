import express from "express";
import { bookSlot, cancelBooking, getAvailableSlots } from "../controller/slotController.js";

const slotRouter = express.Router();

slotRouter.post("/book", bookSlot);
slotRouter.post("/cancel/:id", cancelBooking);
slotRouter.get("/available/:courtId", getAvailableSlots);

export default slotRouter;
