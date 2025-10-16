const router = require("express").Router();
const Controller = require("../controllers/OnlyForDev.Controller");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("/fix-keymetrics", Controller.fixKeymetrics);
router.post("/fix-growth-levers", Controller.fixGrowthLevers);
router.post("/fix-role", Controller.fixRole);

module.exports = router;
