const schedule = require("node-schedule");

const format = require("date-fns/format");
const endOfYesterday = require("date-fns/endOfYesterday");

const Flyt = require("./flyt");
const Cache = require("./cache");

const Scheduler = {
  scheduleJob: () => {
    // Trigger this job to run at 00:00 every day to calculate policy payouts
    // for the previous day.
    return schedule.scheduleJob("0 0 0 * * ?", async () => {
      const date = format(endOfYesterday(), "yyyy-MM-dd");

      // Get the previous UTC date.
      const policyIds = await Cache.get(date, "payment");
      if (
        policyIds === undefined ||
        policyIds === null ||
        policyIds.length === 0
      ) {
        return;
      }

      for (const policyId of policyIds) {
        // Calculate the payment to be paid.
        const payment = await Flyt.calculatePayment(policyId);

        // Pay the policy owner.
        if (!payment.isNaN(payment) && payment > 0) {
          await Flyt.pay(policyId, payment);
        }
      }

      // Remove all the policyIds for this date.
      await Cache.set(date, [], "payment");
    });
  }
};

module.exports = Scheduler;
