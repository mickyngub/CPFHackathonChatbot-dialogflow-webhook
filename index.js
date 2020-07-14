const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const port = process.env.PORT || 4000;

const { WebhookClient } = require("dialogflow-fulfillment");

app.use(morgan("dev"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({
    success: true,
  });
});

app.post("/webhook", (req, res) => {
  console.log("POST: /");
  console.log("Body: ", req.body);

  const agent = new WebhookClient({
    request: req,
    response: res,
  });

  console.log("agentVersion: " + agent.agentVersion);
  console.log("intent: " + agent.intent);
  console.log("locale: " + agent.locale);
  console.log("query: ", agent.query);
  console.log("session: ", agent.session);

  const itemConfirmYes = (agent) => {
    console.log("itemConfirmYes");
  };
  const testhook = (agent) => {
    agent.add("The webhook is working!");
  };

  const orderShowBasket = (agent) => {
    agent.add("Nothing is in the basket");
  };

  let intentMap = new Map();
  intentMap.set("besthook", testhook);
  intentMap.set("order-showbasket", orderShowBasket);
  intentMap.set("item-confirm-yes", itemConfirmYes);
  agent.handleRequest(intentMap);
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
