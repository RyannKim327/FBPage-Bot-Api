const fs = require("fs");
const express = require("express");
const axios = require("axios");
const path = require("path");
const bodyParser = require("body-parser");

class FacebookPage {
  constructor() {
    this.FB_TOKEN = process.env.FB_TOKEN;
    this.KEY_TOKEN = process.env.KEY_TOKEN || "pagebot";
    this.webhook = "/webhook";
    this.__app = express();
    this.__app.use(bodyParser.json());
    this.__app.use(express.json());
    this.__app.use(
      "/assets",
      express.static(path.join(__dirname, "../assets")),
    );
    this.__app.use("/temp", express.static(path.join(__dirname, "../temp")));
    this.__port = process.env.PORT || 3000;
    this.prefix = "/";
    this.commands = [];
    this.start = true;
    this.version = "v23.0";
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

  // TODO: To create a catch if there is no command to be executed
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

  setWebhook(webhook) {
    if (!webhook.startsWith("/")) {
      webhook = `/${webhook}`;
    }
    this.webhook;
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
            url: fileUrl,
            is_reusable: true,
          },
        },
      },
    };

    let url = "messages";

    if (!fileUrl) {
      return this.sendMessage("Undefined File URL");
    }
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
    }

    axios
      .post(
        `https://graph.facebook.com/${this.version}/me/${url}?access_token=${this.FB_TOKEN}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.FB_TOKEN}`,
            "Content-Type": "application/json",
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
    if (typeof message === "object") {
      if (message.text) {
        msg = message.text;
      }
    }

    const sendMsg = (str) => {
      axios
        .post(
          `https://graph.facebook.com/${this.version}/me/messages?access_token=${this.FB_TOKEN}`,
          {
            message: { text: str },
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
    };

    if (typeof msg !== "string") {
      return console.error(
        `Send Message [ERR]: Message must be in string format`,
      );
    }

    let msgs = msg.split(" ");
    if (msgs.length >= 300) {
      const words = 250;
      let m = 0;
      const x = () => {
        if (m < Math.ceil(msgs.length / words)) {
          const msg_ = msgs.slice(m * words, (m + 1) * words);
          sendMsg(msg_.join(" "));
          m++;
          setTimeout(() => {
            x();
          }, 1500);
        }
      };
      x();
    } else {
      sendMsg(msg);
    }
  }

  // INFO: Private Functions
  #postback(event) {
    const payload = event.postback.payload;

    this.sendMessage(
      `[INFO]: This is a message from a postback with payload: ${payload}`,
      event,
    );
  }

  #regex(command, unpref) {
    if (typeof command !== "string") {
      if (command.command) {
        command = command.command;
      }
    }
    if (typeof command === "string") {
      if (unpref) {
        return new RegExp(`^${command}`, "i");
      }

      let prefix = this.prefix;
      const prefixes = ["/", "\\", "$", "^"];
      if (prefixes.includes(prefix)) {
        prefix = `\\${prefix}`;
      }

      return new RegExp(`^${prefix}${command}`, "i");
    }
  }

  #help(event) {
    this.commands.sort((a, b) => {
      const _a = JSON.stringify(Object.values(a).sort());
      const _b = JSON.stringify(Object.values(b).sort());
      if (_a < _b) return -1;
      if (_a > _b) return 1;
      return 0;
    });
    let message = `Hello, I am the automated service of MPOP Reverse II named AI Haibara. I'm using the prefix: "${this.prefix}" Without quotation mark.\n\n Here are my commands and services, so feel free to use if needed.\n\n`;
    let i = 1;
    for (let c of this.commands) {
      if (c.title && c.command && !c.hidden) {
        let command = c.command.replace(/\([^)]*\)/gi, "[args]");
        let maintenance = "";
        if (c.maintenance) {
          maintenance = "[Under Maintenance]";
        }
        let msg = `${i}. Command name: ${c.title}\nCommand: "${this.prefix}${command}" ${maintenance}`;
        if (c.description) {
          msg += `\n  ~ ${c.description}`;
        } else {
          msg += "\n  ~ No description provided";
        }
        message += `${msg}\n\n`;
        i++;
      }
    }
    if (this.fallback) {
      if (this.fallback.title) {
        message += `If the command didn't exists, or not match, there's something what we call a fallback where it is called as ${this.fallback.title}`;
      }
    }
    this.sendMessage(message, event);
  }

  #processhandler(event) {
    let done = false;
    const commands = this.commands;
    let c = 0;
    const execute = () => {
      let command = commands[c];
      let unpref = command.unprefix;
      console.log(command);
      console.log(unpref);
      const _regex = this.#regex(command.command, unpref);
      if (_regex.test(event.message.text) && !done) {
        const script = require(`./../src/${command.script}`);
        done = true;
        script(this, event, _regex);
      } else if (!done && c < commands.length - 1) {
        c++;
        execute();
      }
    };

    const regex = this.#regex("help");
    if (regex.test(event.message.text)) {
      this.#help(event);
      done = true;
    } else {
      execute();

      if (
        event.message.text.startsWith(this.prefix) &&
        this.fallback !== null &&
        typeof this.fallback === "object" &&
        !done
      ) {
        const script = require(`./../src/${this.fallback.script}`);
        script(this, event, this.prefix);
      }
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
      this.hostname = req.hostname;
      res.send(
        "The main webpage was started. Please verify your token by calling it with a webhook on facebook developer's page",
      );
    });

    app.get(this.webhook, (req, res) => {
      this.hostname = req.hostname;
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

    app.post(this.webhook, (req, res) => {
      const body = req.body;
      this.hostname = req.hostname;
      if (body.object === "page") {
        body.entry.forEach((entry) => {
          entry.messaging.forEach((event) => {
            if (event.message) {
              if (event.message.text) {
                // if (event.message.text.startsWith(this.prefix)) {
                this.#processhandler(event);
                // }
              }
            } else {
              // this.#postback(event);
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
