import cron from "node-cron";
import { GymUsers } from "../model/gymUserSchema.js";

// Run every midnight
cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  try {
    // Expire old subscriptions
    await GymUsers.updateMany(
      { "subscription.endDate": { $lt: now } },
      { $set: { "subscription.status": "expired" } }
    );

    // Activate ongoing subscriptions
    await GymUsers.updateMany(
      { "subscription.startDate": { $lte: now }, "subscription.endDate": { $gte: now } },
      { $set: { "subscription.status": "active" } }
    );

    // Mark upcoming subscriptions
    await GymUsers.updateMany(
      { "subscription.startDate": { $gt: now } },
      { $set: { "subscription.status": "upcoming" } }
    );

    console.log("✅ Subscription statuses updated");
  } catch (err) {
    console.error("❌ Error updating subscription statuses:", err);
  }
});
