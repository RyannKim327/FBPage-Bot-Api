// Echo Command - Sample Command Implementation
// Repeats back what the user says

module.exports = (api, event, regex) => {
  // Extract the matched text from the regex
  const match = event.message.text.match(regex);
  
  if (match && match[1]) {
    const userText = match[1].trim();
    
    // Send the echoed message back to the user
    api.sendMessage(`🔄 Echo: ${userText}`, event, (error, response) => {
      if (error) {
        console.error("Echo command error:", error);
        api.sendMessage("❌ Sorry, there was an error processing your echo command.", event);
      } else {
        console.log(`✅ Echo command executed for user ${event.sender.id}`);
      }
    });
  } else {
    // No text provided
    api.sendMessage("❓ Please provide some text to echo. Example: /echo Hello World", event);
  }
};