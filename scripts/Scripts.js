const User = require("../models/User.model");
const TimeZone = require("../models/TimeZone.model");

module.exports = {
  // create timezone for all owners
  create: async () => {
    try {
      const owners = await User.find({ role: "owner" });

      for (let i = 0; i < owners.length; i++) {
        // check if timezone already exists for the owner
        const timezone = await TimeZone.findOne({ owner: owners[i]._id });
        if (!timezone) {
          const timezone = new TimeZone({
            owner: owners[i]._id,
            name: "",
          });
          await timezone.save();
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
