import { Router } from 'express'
import { getLatestBookings } from '../controller/bookingController.js';

const bookingRouter=Router();
bookingRouter.route('/latest-booking').get(getLatestBookings);
export default bookingRouter