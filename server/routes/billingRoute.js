import { Router } from "express";
import { getBillingsByCourt } from "../controller/billingController.js";
const billingRouter=Router();
billingRouter.route('/court-payment-history/:id').get(getBillingsByCourt)//{id:courtId}
export default billingRouter