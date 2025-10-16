const express = require("express");
const router = express.Router();
const Controller = require("../controllers/funnelProject.controller.js");
const { verifyAccessToken } = require("../helpers/jwt_helper");

router.post("", verifyAccessToken, Controller.createProject);
router.post("/blueprint", verifyAccessToken, Controller.createBlueprintProject);
router.patch("/:projectId", verifyAccessToken, Controller.updateProject);
router.get("", verifyAccessToken, Controller.getAllProjects);
router.get("/:projectId", verifyAccessToken, Controller.getSingleProject);
router.delete("/:projectId", verifyAccessToken, Controller.deleteProject);
router.post(
  "/:projectId/scenario",
  verifyAccessToken,
  Controller.createScenario
);
router.delete(
  "/:projectId/scenario/:scenarioId",
  verifyAccessToken,
  Controller.deleteScenario
);
router.patch(
  "/:projectId/scenario/:scenarioId/nodes",
  verifyAccessToken,
  Controller.updateNodes
);
router.patch(
  "/:projectId/scenario/:scenarioId/edges",
  verifyAccessToken,
  Controller.updateEdges
);
router.post("/:projectId/expense", verifyAccessToken, Controller.addExpense);
router.patch(
  "/:projectId/expense/:expenseId",
  verifyAccessToken,
  Controller.updateExpense
);
router.delete(
  "/:projectId/expense/:expenseId",
  verifyAccessToken,
  Controller.deleteExpense
);
router.post(
  "/:projectId/scenario/:scenarioId/products",
  verifyAccessToken,
  Controller.addProducts
);
router.patch(
  "/:projectId/scenario/:scenarioId/products/:productId",
  verifyAccessToken,
  Controller.updateProduct
);
router.delete(
  "/:projectId/scenario/:scenarioId/products/:productId",
  verifyAccessToken,
  Controller.deleteProduct
);
router.post(
  "/:projectId/scenario/:scenarioId/version",
  verifyAccessToken,
  Controller.createVersion
);
router.get(
  "/:projectId/scenario/:scenarioId/version/:versionId/use",
  verifyAccessToken,
  Controller.useThisVersion
);

module.exports = router;
