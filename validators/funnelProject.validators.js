const Joi = require("joi");

const options = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

module.exports = {
  createProject: (data) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().default(""),
    });

    return schema.validate(data ? data : {}, options);
  },
  createBlueprintProject: (data) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      nodes: Joi.string().required(),
      edges: Joi.string().required(),
    });

    return schema.validate(data ? data : {}, options);
  },
  updateProject: (data) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().default(""),
      processingRatePercent: Joi.number().default(2.9),
      perTransactionFee: Joi.number().default(0.3),
    });

    return schema.validate(data ? data : {}, options);
  },
};
