const body = require("body-parser");
const fs = require("fs");
const express = require("express");
const request = require("request");

class FacebookPage {
  constructor() {
    this.FB_TOKEN = process.env.FB_TOKEN;
    this.KEY_TOKEN = process.env.KEY_TOKEN || "pagebot";
    this.app = express();
    this.app.use(body.json());
    this.__port = process.env.PORT || 3000;
    this.prefix = "/";
    this.commands = [];
    this.start = true;
  }

  // INFO: Public functions
  addCommand(script, command) {
    let file = `${process.cwd()}/src/${script}`;
    if (!script.endsWith(".js")) {
      file += ".js";
    }
    if (!fs.existsSync(file)) {
      this.start = false;
      return console.error(
        `Script [ERR]: The directory of the command is invalid or not found.`,
      );
    }
    if (!command) {
      this.start = false;
      return console.error(
        `Command [ERR]: The command must be exists or configured.`,
      );
    }
    if (!command.title || !command.command) {
      this.start = false;
      return console.error(
        `Commands [ERR]: Kindly check your command if there's a title and/or command`,
      );
    }
    command["script"] = script;
    this.commands.push(command);
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  sendMessage(message, event, callback) {
    if (!this.FB_TOKEN) {
      return console.error(`TOKEN [ERR]: Undefined FB_TOKEN`);
    }
    if (typeof event !== "object") {
      return console.error(
        "ERROR [event type]: The event must be in Object or JSON type",
      );
    }

    let msg = message;

    if (typeof message === "string") {
      msg = { text: message };
    }
    request(
      {
        url: "https://graph.facebook.com/v13.0/me/messages",
        qs: { access_token: this.FB_TOKEN },
        method: "POST",
        json: {
          recipient: { id: event.sender.id },
          message: msg,
        },
      },
      (error, response, body) => {
        if (error) {
          console.error("Error sending message:", error);
        } else if (response.body.error) {
          console.error("Error response:", response.body.error);
        } else {
          console.log("Message sent successfully:", body);
          if (callback) {
            if (typeof callback === "function") {
              callback();
            }
          }
        }
        console.log("Sent");
      },
    );
  }

  // INFO: Private Functions
  #postback(event) {
    const payload = event.postback.payload;

    this.sendMessage(
      `[INFO]: This is a message from a postback with payload: ${payload}`,
      event,
    );
  }

  #regex(command) {
    if (typeof command !== "string") {
      if (command.command) {
        command = command.command;
      }
    }
    if (typeof command === "string") {
      let prefix = this.prefix;
      const prefixes = ["/", "\\", "$", "^"];
      if (prefixes.includes(prefix)) {
        prefix = `\\${prefix}`;
      }
      console.log(prefix);
      return new RegExp(`${prefix}${command}`, "i");
    }
  }

  #processhandler(event) {
    console.log(event);
    let done = false;
    const commands = this.commands;
    let c = 0;
    const execute = () => {
      let command = commands[c];
      const _regex = this.#regex(command.command);
      if (_regex.test(event.message.text) && !done) {
        const script = require(`./../src/${command.script}`);
        done = true;
        script(this, event, _regex);
      } else if (!done) {
        c++;
        execute();
      }
    };
    execute();
  }

  // INFO: Webhook process
  webhookListener(actions) {
    this.start = true && this.commands.length > 0;

    if (!this.start) {
      return console.error(
        `The're a problem with your configuration. Kindly check it first`,
      );
    }

    // if (typeof actions !== "function")
    //   return console.error(`Action type [ERROR]: Actions must be function.`);

    const app = this.app;
    app.get("/", (req, res) => {
      res.send("The main webpage was started.");
    });

    app.get("/webhook", (req, res) => {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (token && mode) {
        if (mode === "subscribe" && token === this.KEY_TOKEN) {
          res.status(200).send(challenge);
        } else {
          res.status(403);
        }
      }
    });

    app.post("/webhook", (req, res) => {
      const body = req.body;
      if (body.object === "page") {
        body.entry.forEach((entry) => {
          entry.messaging.forEach((event) => {
            if (event.message) {
              if (event.message.text.startsWith(this.prefix)) {
                // actions(event);
                this.#processhandler(event);
              }
            } else {
              this.#postback(event);
            }
          });
        });
        res.status(200).send("EVENT_RECEIVED");
      }
    });

    this.app.listen(this.__port, () => {
      console.log("The service is now started");
    });
  }
}

module.exports = FacebookPage;
