import express from "express";
const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.send("<h1>hello From Node</h1>");
});

export default indexRouter;
