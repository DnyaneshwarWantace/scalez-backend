const router = require('express').Router();
const Controller = require('../controllers/Workspace.Controller');
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post('/create', verifyAccessToken, Controller.create);


module.exports = router;