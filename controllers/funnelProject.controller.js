const project_validators = require("../validators/funnelProject.validators");
const ProjectModel = require("../models/FunnelProject.model");
const mongoose = require("mongoose");
const ProductModal = require("../models/Product.model");
const ExpenseModel = require("../models/Expense.model");
const VersionModel = require("../models/Version.model");
const helpers = require("../utils/helper");
const constants = require("../utils/constants");
const messages = require("../utils/message");

module.exports = {
  getAllProjects: async (req, res) => {
    try {
      // Get all projects
      let projects = await ProjectModel.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_LIST("Project"),
        { projects }
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  getSingleProject: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;

      if (projectId == "0") {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Get single project
      let project = await ProjectModel.findById(projectId)
        .populate({
          path: "scenario",
          populate: {
            path: "products",
          },
        })
        .populate({
          path: "scenario",
          populate: {
            path: "expenses",
          },
        })
        .populate({
          path: "scenario",
          populate: {
            path: "versions",
          },
        });

      if (project.scenario?.length !== 0) {
        project.scenario = project.scenario.map((ts) => {
          ts.nodes = ts.nodes.map((node) => {
            let tempNode = { ...node };
            tempNode.data.product =
              project.scenario
                .find((s) => s._id == ts._id)
                .products.find((product) => {
                  return (
                    product?._id?.toString() == node?.data?.product?.toString()
                  );
                }) || null;
            return tempNode;
          });

          return ts;
        });
      }

      if (project == null && projectId == "0") {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE("Project"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  createProject: async (req, res) => {
    try {
      // Validate request data
      let validatedData = project_validators.createProject(req.body);
      if (Object.keys(validatedData).includes("error")) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.VALIDATION_ERROR,
          validatedData.error.details
        );
      }

      // Get validated data
      let { title, description } = validatedData.value;

      // Create project
      let newVersion = await VersionModel();
      newVersion.name = "Scenario 1";
      newVersion.nodes = [];
      newVersion.edges = [];
      newVersion.expenses = [];
      newVersion.products = [];
      await newVersion.save();

      let project = await ProjectModel();
      project.title = title;
      project.description = description;
      project.createdBy = req.user._id;
      project.scenario = {
        name: "Scenario 1",
        nodes: [],
        edges: [],
        expenses: [],
        products: [],
        versions: [newVersion],
      };
      await project.save();

      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_CREATED("Project"),
        { project }
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },
  createBlueprintProject: async (req, res) => {
    try {
      // Validate request data
      let validatedData = project_validators.createBlueprintProject(req.body);
      if (Object.keys(validatedData).includes("error")) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.VALIDATION_ERROR,
          validatedData.error.details
        );
      }

      // Get validated data
      let { title, nodes, edges } = validatedData.value;
      nodes = JSON.parse(nodes);
      edges = JSON.parse(edges);

      // Create project
      let project = await ProjectModel();
      project.title = title;
      project.createdBy = req.user._id;
      project.scenario = {
        name: "Scenario 1",
        nodes: nodes,
        edges: edges,
        expenses: [],
        products: [],
      };
      await project.save();

      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_CREATED("Project"),
        { project }
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },
  updateProject: async (req, res) => {
    try {
      const projectId = req.params.projectId;

      // Validate request data
      let validatedData = project_validators.updateProject(req.body);
      if (Object.keys(validatedData).includes("error")) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.VALIDATION_ERROR,
          validatedData.error.details
        );
      }

      // Get validated data
      let { title, description, processingRatePercent, perTransactionFee } =
        validatedData.value;

      // Create project
      let project = await ProjectModel.findById(projectId);
      project.title = title;
      project.description = description;
      project.processingRatePercent = processingRatePercent;
      project.perTransactionFee = perTransactionFee;
      await project.save();

      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_UPDATED("Project"),
        { project }
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },
  deleteProject: async (req, res) => {
    try {
      const projectId = req.params.projectId;

      // Get target project
      let project = await ProjectModel.findById(projectId);

      // Delete project
      await project.delete();

      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_DELETED("Project"),
        { project }
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },
  updateNodes: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const scenarioId = req.params.scenarioId;
      const nodes = req.body.nodes;

      if (projectId == "0") {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Get single project
      const project = await ProjectModel.findById(projectId).populate(
        "scenario.products"
      );

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Update Nodes
      const updatedNodes = await Promise.all(
        nodes.map(async (singleNode) => {
          let targetProduct = singleNode.data.product;

          let tempNode = { ...singleNode };
          tempNode.data.product =
            project.scenario
              .find((s) => s.id === scenarioId)
              .products.find((product) => {
                return product.id == targetProduct;
              })?._id || null;

          return tempNode;
        })
      );

      try {
        project.scenario.map((s) => {
          if (s.id === scenarioId) {
            s.nodes = updatedNodes;
            return s;
          } else {
            return s;
          }
        });
        await project.save();
      } catch (err) {
        console.log(err);
      }

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_UPDATED("Nodes"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  updateEdges: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const scenarioId = req.params.scenarioId;
      const edges = req.body.edges;

      if (projectId == "0") {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Get single project
      const project = await ProjectModel.findById(projectId).populate(
        "scenario.products"
      );

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Update Nodes
      try {
        project.scenario.find((s) => s.id === scenarioId).edges = edges;
        await project.save();
      } catch (err) {
        console.log(err);
      }

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_UPDATED("Edges"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  addExpense: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const expenseName = req.body.expenseName;
      const billingFrequency = req.body.billingFrequency;
      const amount = req.body.amount;

      // Get single project
      const project = await ProjectModel.findById(projectId);

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Create new expense
      const newExpense = await new ExpenseModel({
        expenseName,
        billingFrequency,
        amount,
      });
      newExpense.save();

      try {
        project.expenses = [...project.expenses, newExpense];
        await project.save();
      } catch (err) {
        console.log(err);
      }

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_CREATED("Expense"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  updateExpense: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const expenseId = req.params.expenseId;
      const expenseName = req.body.expenseName;
      const billingFrequency = req.body.billingFrequency;
      const amount = req.body.amount;

      // Get single project
      const project = await ProjectModel.findById(projectId);
      const expense = await ExpenseModel.findById(expenseId);

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      if (expense == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Expense not found")
        );
      }

      // Update expense
      expense.expenseName = expenseName;
      expense.billingFrequency = billingFrequency;
      expense.amount = amount;

      await expense.save();

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_UPDATED("Expense"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  deleteExpense: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const expenseId = req.params.expenseId;

      // Get single project
      const project = await ProjectModel.findById(projectId);
      const expense = await ExpenseModel.findById(expenseId);

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      if (expense == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Expense not found")
        );
      }

      // Delete expense
      await expense.delete();

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_DELETED("Expense"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  addProducts: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const scenarioId = req.params.scenarioId;
      const { name, type, price, priceType, refundRate, cost, stickRate } =
        req.body;

      // Get single project
      const project = await ProjectModel.findById(projectId);

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Update Nodes
      const newProduct = new ProductModal({
        name,
        type,
        price,
        priceType,
        refundRate,
        cost,
        stickRate,
      });
      await newProduct.save();

      try {
        // Add product to scenario
        console.log(project.scenario);
        project.scenario
          .find((s) => s.id === scenarioId)
          .products.push(newProduct);

        await project.save();
      } catch (err) {
        console.log(err);
      }

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_CREATED("Product"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  updateProduct: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const productId = req.params.productId;
      const scenarioId = req.params.scenarioId;
      const { name, type, price, priceType, refundRate, cost, stickRate } =
        req.body;

      // Get single project
      const project = await ProjectModel.findById(projectId);
      const product = await ProductModel.findById(productId);

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      // Update product
      product.name = name;
      product.type = type;
      product.price = price;
      product.priceType = priceType;
      product.refundRate = refundRate;
      product.cost = cost;
      product.stickRate = stickRate;

      await product.save();

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_UPDATED("Product"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  deleteProduct: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const productId = req.params.productId;

      // Get single project
      const project = await ProjectModel.findById(projectId);
      const product = await ProductModel.findById(productId);

      if (project == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Project not found")
        );
      }

      if (product == null) {
        return helpers.createResponse(
          res,
          constants.BAD_REQUEST,
          messages.MODULE("Product not found")
        );
      }

      // Delete product
      await product.delete();

      // Response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_DELETED("Product"),
        project
      );
    } catch (e) {
      console.log(e);
      helpers.createResponse(
        res,
        constants.SERVER_ERROR,
        messages.SERVER_ERROR,
        { error: e.message }
      );
    }
  },
  createScenario: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;

      // Get target project
      const targetProject = await ProjectModel.findById(projectId);

      // Add new scenario
      await ProjectModel.findByIdAndUpdate(projectId, {
        $push: {
          scenario: {
            name: `Scenario ${targetProject.scenario.length + 1}`,
            nodes: [],
            edges: [],
            expenses: [],
            products: [],
          },
        },
      });

      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_CREATED("Scenario"),
        {}
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },

  deleteScenario: async (req, res) => {
    try {
      const scenarioId = req.params.scenarioId;

      // Delete scenario
      await ProjectModel.findByIdAndUpdate(req.params.projectId, {
        $pull: { scenario: { _id: scenarioId } },
      });

      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_DELETED("Scenario"),
        {}
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },

  createVersion: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const scenarioId = req.params.scenarioId;

      // Get target project
      const targetProject = await ProjectModel.findById(projectId);
      const targetScenario = targetProject.scenario.find(
        (s) => s.id == scenarioId
      );
      const latestVersion =
        targetScenario.versions[targetScenario.versions.length - 1];
      const latestVersionObj = await VersionModel.findById(latestVersion);

      console.log(targetScenario);
      console.log(latestVersionObj);

      // Check if new version is required
      if (
        targetScenario?.nodes.length != latestVersionObj?.nodes?.length ||
        targetScenario?.edges.length != latestVersionObj?.edges?.length
      ) {
        // Create new version
        const newVersion = await VersionModel();
        newVersion.versionName = `Version ${
          targetScenario.versions.length + 1
        }`;
        newVersion.name = targetScenario.name;
        newVersion.nodes = targetScenario.nodes;
        newVersion.edges = targetScenario.edges;
        newVersion.expenses = targetScenario.expenses;
        newVersion.products = targetScenario.products;
        await newVersion.save();

        //  Push version to scenario
        targetProject.scenario = targetProject.scenario.map((s) => {
          if (s.id == scenarioId) {
            s.versions.push(newVersion);
          }

          return s;
        });

        await targetProject.save();

        // Return response
        return helpers.createResponse(
          res,
          constants.SUCCESS,
          messages.MODULE_CREATED("Version"),
          {}
        );
      } else {
        return helpers.createResponse(
          res,
          constants.SUCCESS,
          messages.MODULE_CREATED("Latest version is already up to date"),
          {}
        );
      }
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },

  useThisVersion: async (req, res) => {
    try {
      // Get project id
      const projectId = req.params.projectId;
      const scenarioId = req.params.scenarioId;
      const versionId = req.params.versionId;

      // Get target project
      const targetProject = await ProjectModel.findById(projectId);
      const targetScenario = targetProject.scenario.find(
        (s) => s.id == scenarioId
      );
      const targetVersion = targetScenario.versions.find(
        (v) => v.toString() == versionId
      );
      const targetVersionObj = await VersionModel.findById(targetVersion);

      // Save targetVersionObj data into scenario
      targetScenario.nodes = targetVersionObj.nodes;
      targetScenario.edges = targetVersionObj.edges;
      targetScenario.expenses = targetVersionObj.expenses;
      targetScenario.products = targetVersionObj.products;

      await targetProject.save();

      // Return response
      return helpers.createResponse(
        res,
        constants.SUCCESS,
        messages.MODULE_UPDATED("Scenario"),
        {}
      );
    } catch (err) {
      console.log(err);

      return helpers.createResponse(
        res,
        constants.BAD_REQUEST,
        messages.GENERATION_ERROR
      );
    }
  },
};
