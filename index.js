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
    const item = agent.context.get("item"),
      food = item.parameters.food,
      quantity = item.parameters.quantity,
      type = item.parameters.type;
    // console.log("This is agent.context", agent.context);
    // console.log("This is agent", agent);
    // console.log("This is item", item);
    // console.log("This is food", food);
    // console.log("This is quantity", quantity);
    // console.log("This is type", type);

    var basketContext = {
        name: "basket",
        lifespan: 50,
        parameters: {},
      },
      items = {};
    if (agent.context.get("basket")) {
      items = agent.context.get("basket").parameters.items;
    }
    items[req.body.responseId] = {
      food: food,
      quantity: quantity,
      type: type,
    };
    basketContext.parameters.items = items;
    console.log(JSON.stringify(basketContext));
    agent.context.set(basketContext);
    agent.add(
      `Confirming ${quantity} of ${type} ${food}. Do you want anything else?`
    );
  };
  const testhook = (agent) => {
    agent.add("The webhook is working!");
  };

  const orderShowBasket = (agent) => {
    if (agent.context.get("basket")) {
      const basket = agent.context.get("basket"),
        basketItems = basket.parameters.items,
        itemKeys = Object.keys(basketItems);
      var basketOutput = "So far you've got: ";
      for (let i = 0; i < itemKeys.length; i++) {
        let item = basketItems[itemKeys[i]];
        if (i > 0 && i === itemKeys.length - 1) {
          basketOutput += ` and `;
        } else if (i > 0) {
          basketOutput += ` , `;
        }
        basketOutput += `${item.quantity} of ${item.type} ${item.food}`;
      }
      agent.add(basketOutput);
    } else {
      agent.add("You've not order yet!");
    }
  };

  const orderClearBasket = (agent) => {
    if (agent.context.get("basket")) {
      const basket = agent.context.get("basket");
      basket.parameters.items = {};
    }
    agent.add("Your basket is now empty!");
  };

  let intentMap = new Map();
  intentMap.set("besthook", testhook);
  intentMap.set("order-showbasket", orderShowBasket);
  intentMap.set("order-clearbasket", orderClearBasket);
  intentMap.set("item-confirm-yes", itemConfirmYes);
  agent.handleRequest(intentMap);
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
