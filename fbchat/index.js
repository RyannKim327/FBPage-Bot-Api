/*
 * INFO:
 * Programmer: Ryann Kim Sesgundo [MPOP Reverse II]
 * 
 * INFO: Purpose
 * This file is the core of all process within the project.
 * It was designed to OOP to control and manage a single data
 * to prevent multiple calls if ever that there's changes
 * within the information of the project. This was also
 * used to clean up something and to practice propper OOP format.
*/

const fs = require("fs");
const express = require("express");
const axios = require("axios");
const path = require("path");

class FacebookPage {
  constructor() {
    this.FB_TOKEN = process.env.FB_TOKEN;
    this.KEY_TOKEN = process.env.KEY_TOKEN || "pagebot";
    this.__webhook = "/webhook";
    this.__assets = "/assets";
    this.__temp = "/temp";
    this.__assistant = "AI Haibara";
    this.__app = express();
    this.__app.use(express.json());
    this.__app.use(
      this.__assets,
      express.static(path.join(__dirname, `..${this.__assets}`)),
    );
    this.__app.use(
      this.__temp,
      express.static(path.join(__dirname, `..${this.__temp}`)),
    );
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
    this.__admins = [];

    // TODO: To auto clear the temporary files for unexpected close
    if (fs.existsSync(`${__dirname}/..${this.__temp}/`)) {
      fs.rm(`${__dirname}/..${this.__temp}/`, { recursive: true }, (e) => { });
    }

    setTimeout(() => {
      fs.mkdirSync(`${__dirname}/..${this.__temp}`);
    }, 150);
  }

  // INFO: Public functions
  addAdmin(adminID) {
    this.__admins.push(adminID);
  }

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

  addPublicFolder(folder) {
    this.__app.use(
      `/${folder}`,
      express.static(path.join(__dirname, `../${folder}`)),
    );
  }

  getAssistant() {
    // TODO: To extract the name of the Bot from the main source to the other call files
    return this.__assistant;
  }

  setAssistant(name) {
    this.__assistant = name;
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
    this.__webhook = webhook;
  }

  setAssetsFolder(assets) {
    if (!assets.startsWith("/")) {
      assets = `/${assets}`;
    }
    this.__assets = assets;
  }

  setTemporaryFolder(temp) {
    if (!temp.startsWith("/")) {
      temp = `/${temp}`;
    }
    this.__temp = temp;
  }

  sendAttachment(fileType, fileUrl, event, callback) {
    if (!this.FB_TOKEN) {
      if (typeof callback === "function") {
        return callback("ERR: Undefined FB_TOKEN", null);
      }
      return console.error(`TOKEN [ERR]: Undefined FB_TOKEN`);
    }

    if (typeof event !== "object") {
      if (typeof callback === "function") {
        return callback("ERR: The event muyst be an Object or JSON type", null);
      }
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
      if (typeof callback === "function") {
        return callback("ERR: Undefined File URL", null);
      }
      return this.#sendMessage("Undefined File URL", event);
    }
    if (!fileUrl.startsWith("http")) {
      // TODO: Trigger the condition for local storage such as temp and assets
      if (!fileUrl.startsWith("/")) {
        fileUrl = `/${fileUrl}`;
      }

      if (!fs.existsSync(fileUrl)) {
        if (typeof callback === "function") {
          return callback("ERR: File doesn't exists", null);
        }
        return this.sendMessage("File doesn't exists", event);
      }

      let file = fileUrl.split(`${this.__assets.substring(1)}/`)[1];
      let folder = this.__assets.substring(1);

      if (
        fileUrl.includes(this.__temp) &&
        !fileUrl.includes(this.__assets.substring(1))
      ) {
        file = fileUrl.split(`${this.__temp.substring(1)}/`)[1];
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
            callback(null, response);
          }
        }
      })
      .catch((error) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(error, null);
          }
        }
      });
  }

  sendMessage(message, event, callback) {
    // TODO: Verify FB TOKEN existence
    if (!this.FB_TOKEN) {
      if (typeof callback === "function") {
        return callback("ERR: Undefined FB_TOKEN", null);
      }
      return console.error(`TOKEN[ERR]: Undefined FB_TOKEN`);
    }

    // TODO: Verify if the event is an object/JSON
    if (typeof event !== "object") {
      if (typeof callback === "function") {
        return callback("ERR: The event must be an Object or JSON type", null);
      }
      return console.error(
        "ERROR [event type]: The event must be an Object or JSON type",
      );
    }

    let msg = message;
    if (typeof message === "object") {
      if (message.text) {
        msg = message.text;
      }
    }

    if (typeof msg !== "string") {
      if (typeof callback === "function") {
        return callback("ERR: Text must be string", null);
      }
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
          this.#sendMessage(msg_.join(" "), event, callback);
          m++;
          setTimeout(() => {
            x();
          }, 1500);
        }
      };
      x();
    } else {
      this.#sendMessage(msg, event, callback);
    }
  }

  sendToAdmin(message, callback) {
    // TODO: Verify FB TOKEN existence
    if (!this.FB_TOKEN) {
      if (typeof callback === "function") {
        return callback("ERR: Invalid FB_TOKEN", null);
      }
      return console.error(`ERR: Undefined FB_TOKEN`);
    }

    let msg = message;
    if (typeof message === "object") {
      if (message.text) {
        msg = message.text;
      }
    }

    const sendMsg = async (text) => {
      for await (let admin of this.__admins) {
        const event = {
          sender: {
            id: `${admin}`,
          },
        };
        this.#sendMessage(text, event, callback);
      }
    };

    if (typeof msg !== "string") {
      if (typeof callback === "function") {
        return callback(
          "ERR [Send Message]: Message must be in string format",
          null,
        );
      }
      return console.error(
        `Send Message [ERR]: Message must be in string format`,
      );
    }

    let msgs = msg.split(" ");
    if (msgs.length >= 300) {
      const words = 300;
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

  #regex(command, unpref, any) {
    // TODO: To convert normal text into regex file
    if (typeof command !== "string") {
      if (command.command) {
        command = command.command;
      }
    }
    if (typeof command === "string") {
      let start = "^";
      if (any) {
        start = "";
      }
      if (unpref) {
        return new RegExp(`${start}${command}`, "i");
      }

      let prefix = this.prefix;
      const prefixes = ["/", "\\", "$", "^"];
      if (prefixes.includes(prefix)) {
        prefix = `\\${prefix}`;
      }

      return new RegExp(`${start}${prefix}${command}`, "i");
    }
  }

  #help(event) {
    // TODO: A built-in command that triggers once the help command executed
    this.commands.sort((a, b) => {
      const _a = JSON.stringify(Object.values(a).sort());
      const _b = JSON.stringify(Object.values(b).sort());
      if (_a < _b) return -1;
      if (_a > _b) return 1;
      return 0;
    });
    let message = `Hello, I am the automated service of MPOP Reverse II named ${this.__assistant}. I'm using the prefix: "${this.prefix}" Without quotation mark.\n\n Here are my commands and services, so feel free to use if needed.\n\n`;
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
      let any = command.any ?? false;
      const _regex = this.#regex(command.command, unpref, any);
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

  #sendMessage(text, event, callback) {
    if (!this.FB_TOKEN) {
      if (typeof callback === "function") {
        return callback("ERR: Undefined FB_TOKEN", null);
      }
      return console.error(`Error: undefined FB TOKEN`);
    }
    if (typeof text !== "string") {
      if (typeof callback === "function") {
        return callback("ERR: Text must be string", null);
      }
      return console.error(`Error: text must be string`);
    }
    axios
      .post(
        `https://graph.facebook.com/${this.version}/me/messages?access_token=${this.FB_TOKEN}`,
        {
          message: { text: text },
          recipient: {
            id: event.sender.id,
          },
        },
      )
      .then((response) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(null, response);
          }
        }
      })
      .catch((error) => {
        if (callback) {
          if (typeof callback === "function") {
            callback(error, null);
          }
        }
      });
  }

  // INFO: Webhook process
  listen(callback) {
    if (this.start) {
      this.start = true && this.commands.length > 0;
    }
    if (!this.start) {
      return console.error(
        `The're a problem with your configuration. Kindly check it first`,
      );
    }

    const app = this.__app;

    if (typeof callback === "function") {
      callback(app);
    }

    app.get("/", (req, res) => {
      this.hostname = req.hostname;
      res.sendFile(`${__dirname}/web/index.html`);
    });

    app.get(this.__webhook, (req, res) => {
      // TODO: To call this webhook, please go to https://developers.facebook.com/apps/your_app_id/messenger/messenger_api_settings/
      // Please note that you also read their terms and conditions to prevent failures
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
      } else {
        res.status(403);
      }
    });

    app.post(this.__webhook, (req, res) => {
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
      } else {
        res.status(403);
      }
    });

    app.listen(this.__port, () => {
      console.log(`The service is now started with port: ${this.__port}`);
    });
  }
}

module.exports = FacebookPage;
