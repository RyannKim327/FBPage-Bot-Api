const bot = require("./fb-bot/index");

const api = new bot();

// INFO: To set prefix '/' by default
api.setPrefix("/");

// INFO: Sample adding a command
// Use regex for command pattern
// scripts must be saved in src folder
api.addCommand("test", {
  title: "Test Command",
  command: "test ([\\w]+)",
});

// INFO: To start action and webhooks
api.webhookListener();

// INFO: Sample sending a text
// Event was saved into your command. Check the src/test.js
// for a clear version of this line of code.
api.sendMessage("Hello", event);
