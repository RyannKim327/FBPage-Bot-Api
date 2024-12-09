const body = require("body-parser");
const fs = require("fs");
const express = require("express");
const axios = require("axios");
const path = require("path");
const os = require("os");

class FacebookPage {
  constructor() {
    this.FB_TOKEN = process.env.FB_TOKEN;
    this.KEY_TOKEN = process.env.KEY_TOKEN || "pagebot";
    this.__app = express();
    this.__app.use(body.json());
    this.__app.use(
      "/assets",
      express.static(path.join(__dirname, "../assets")),
    );
    this.__app.use("/temp", express.static(path.join(__dirname, "../temp")));
    this.__port = process.env.PORT || 3000;
    this.prefix = "/";
    this.commands = [];
    this.start = true;
    this.version = "v21.0";
    this.fallback = null;
    this.types = {
      audio: "audio/mpeg",
      image: "image/png",
      video: "video/mp4",
    };
    this.admin = [];

    if (fs.existsSync(`${__dirname}/../temp/`)) {
      fs.rm(`${__dirname}/../temp/`, { recursive: true }, (e) => {});
    }

    setTimeout(() => {
      fs.mkdirSync(`${__dirname}/../temp`);
    }, 150);
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
        `${script} Script [ERR]: The directory of the command is invalid or not found.`,
      );
    }
    if (!command) {
      this.start = false;
      return console.error(
        `${script} Command [ERR]: The command must be exists or configured.`,
      );
    }
    if (!command.title || !command.command) {
      this.start = false;
      return console.error(
        `${script} Command [ERR]: Kindly check your command if there's a title and/or command`,
      );
    }
    command["script"] = script;
    this.commands.push(command);
  }

  setFallback(script, command) {
    if (typeof script !== "string") {
      this.start = false;
      return console.error("FALLBACK [ERR]: Script must be a string [File]");
    }
    if (!command) {
      this.start = false;
      return console, error("FALLBACK [ERR]: Command must be exists");
    }
    if (typeof command !== "object") {
      this.start = false;
      return console.error(`FALLBACK [ERR]: The command must be an Object`);
    }
    if (!command.title) {
      this.start = false;
      return console.error(`FALLBACK [ERR]: Title must be existed`);
    }
    command["script"] = script;
    this.fallback = command;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  sendAttachment(fileType, fileUrl, event, callback) {
    if (!this.FB_TOKEN) {
      return console.error(`TOKEN [ERR]: Undefined FB_TOKEN`);
    }

    if (typeof event !== "object") {
      return console.error(
        "ERROR [event type]: The event must be in Object or JSON type",
      );
    }

    let data = {
      recipient: {
        id: event.sender.id,
      },
      message: {
        attachment: {
          type: fileType,
          payload: {
            is_reusable: true,
          },
        },
      },
    };

    let url = "messages";
    if (!fileUrl.startsWith("http")) {
      if (!fileUrl.startsWith("/")) {
        fileUrl = `/${fileUrl}`;
      }

      // url = "message_attachments";
      if (!fs.existsSync(fileUrl.substring())) {
        return this.sendMessage("File doesn't exists", event);
      }

      let file = fileUrl.split("assets/")[1];
      let folder = "assets";
      if (fileUrl.includes("temp") && !fileUrl.includes("assets")) {
        file = fileUrl.split("temp/")[1];
        folder = "temp";
      }

      data.message.attachment.payload.url = `https://${this.hostname}/${folder}/${file}`;
    } else {
      data.message.attachment.payload.url = fileUrl;
    }

    axios
      .post(
        `https://graph.facebook.com/${this.version}/me/${url}?access_token=${this.FB_TOKEN}`,
        data,
      )
      .then((response) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(false, response);
          }
        }
      })
      .catch((error) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(true, error);
          }
        }
      });
  }

  sendMessage(message, event, callback) {
    if (!this.FB_TOKEN) {
      return console.error(`TOKEN[ERR]: Undefined FB_TOKEN`);
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

    axios
      .post(
        `https://graph.facebook.com/${this.version}/me/messages?access_token=${this.FB_TOKEN}`,
        {
          message: msg,
          recipient: {
            id: event.sender.id,
          },
        },
      )
      .then((response) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(false, response);
          }
        }
      })
      .catch((error) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(true, error);
          }
        }
      });
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

      return new RegExp(`${prefix}${command}`, "i");
    }
  }

  #processhandler(event) {
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
      } else if (!done && c < commands.length - 1) {
        c++;
        execute();
      }
    };
    execute();
    if (this.fallback !== null && typeof this.fallback === "object" && !done) {
      const script = require(`./../src/${this.fallback.script}`);
      script(this, event, this.prefix);
    }
  }

  // INFO: Webhook process
  listen() {
    if (this.start) {
      this.start = true && this.commands.length > 0;
    }
    if (!this.start) {
      return console.error(
        `The're a problem with your configuration. Kindly check it first`,
      );
    }

    const app = this.__app;
    app.get("/", (req, res) => {
      res.send(
        "The main webpage was started. Please verify your token by calling it with a webhook on facebook developer's page",
      );
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
      this.hostname = req.hostname;
      if (body.object === "page") {
        body.entry.forEach((entry) => {
          entry.messaging.forEach((event) => {
            if (event.message) {
              if (event.message.text.startsWith(this.prefix)) {
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

    app.listen(this.__port, () => {
      console.log("The service is now started");
    });
  }
}

module.exports = FacebookPage;
