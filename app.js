var express = require("express");
var app = express();
logger = (req, res, next) => {
  console.log("\x1b[32m", `-------------- ${req.path} --------------`);
  console.log(
    "\x1b[33m",
    "Headers contains authorization: ",
    Object.keys(req.headers).includes("authorization")
  );
  console.log("\x1b[33m", "Method : ", req.method);
  console.log("\x1b[33m", "Path : ", req.path);
  console.log("\x1b[33m", "Body : ", JSON.stringify(req.body));
  console.log("\x1b[33m", "Query Params : ", req.query);
  console.log("\x1b[32m", "-----------------------------------------");
  console.log("");

  next();
};
app.use(logger);
const server = require("http").Server(app);
io = module.exports = require("socket.io")(server);
const createError = require("http-errors");
// const morgan = require("morgan");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
require("./helpers/init_mongodb");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(morgan("dev"));
app.use(cors());

io.on("connection", (io) => {
  console.log("socket connected");

  io.on("disconnect", () => {
    console.log("socket disconnected");
  });
});

messages = module.exports = require("./utils/message");
constants = module.exports = require("./utils/constants");
helpers = module.exports = require("./utils/helper");

app.get("/", async (req, res, next) => {
  res.send({ message: "Awesome it works 🐻" });
});

app.use("/api", require("./routes/api.route"));
app.use("/api/v1/auth", require("./routes/Auth.Route"));
app.use("/api/v1/project", require("./routes/Project.Route"));
app.use("/api/v1/goal", require("./routes/Goal.Route"));
app.use("/api/v1/keymetric", require("./routes/Keymetric.Route"));
app.use("/api/v1/admin", require("./routes/SuperOwner.Route"));
app.use("/api/v1/timezone", require("./routes/TimeZone.Route"));
app.use("/api/v1/idea", require("./routes/Idea.Route"));
app.use("/api/v1/test", require("./routes/Test.Route"));
app.use("/api/v1/learning", require("./routes/Learning.Route"));
app.use("/api/v1/management", require("./routes/Management.Route"));
app.use("/api/v1/models", require("./routes/Model.Route"));
app.use("/api/v1/dashboard", require("./routes/Dashboard.Route"));
app.use("/api/v1/insight", require("./routes/Insights.Route"));
app.use("/api/v1/notification", require("./routes/Notification.Route"));
app.use("/api/v1/plan", require("./routes/Plan.route"));
app.use("/api/v1/category", require("./routes/Category.route"));
app.use("/api/v1/content", require("./routes/Content.route"));
app.use("/api/v1/role", require("./routes/Role.Route"));
app.use("/api/v1/workspace", require("./routes/Workspace.Route"));
app.use("/api/v1/lever", require("./routes/Lever.Route"));
app.use("/api/v1/feedback", require("./routes/Feedback.Route"));
app.use("/api/v1/analytics", require("./routes/Analytics.Route"));
app.use("/api/v1/integration", require("./routes/Integration.Route"));
app.use("/api/v1/channels", require("./routes/Channels.Route"));
app.use("/api/v1/threads", require("./routes/Threads.Route"));
app.use("/api/v1/onlyfordev", require("./routes/OnlyForDev.Route"));
app.use("/api/v1/funnel-project", require("./routes/FunnelProject.route"));

cron.schedule("*/10 * * * * *", () => {
  // require("./scripts/Scripts").create();
  // console.log("cron job for creating tiemzone");
});

app.use((req, res, next) => {
  if (req.path.includes("uploads")) {
    return res.download("." + decodeURIComponent(req.path));
  }
  next(createError.NotFound());
});

// app.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.send({
//     status: err.status || 500,
//     message: err.message,
//   });
// });

const PORT = process.env.PORT || 4003;
server.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
