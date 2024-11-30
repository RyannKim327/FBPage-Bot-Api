module.exports = (api, event, regex) => {
  // NOTE: The required parameters are api and event, the regex is just optional
  // if you have parameters

  // INFO: Sample send message
  api.sendMessage("Test Message", event);
};
