// Facebook Page Bot API - Main Application
// MPOP Reverse II (Ryann Kim Sesgundo)

const FacebookPage = require("./fbchat/index");

// Initialize the bot
const api = new FacebookPage();

// ===== CONFIGURATION =====

// Set command prefix (default: "/")
api.setPrefix("/");

// Set assistant name
api.setAssistant("AI Haibara");

// Set webhook path (optional, default: "/webhook")
api.setWebhook("/webhook");

// ===== ADMIN MANAGEMENT =====

// Add admin users (replace with actual Facebook user IDs)
api.addAdmin("1234567890"); // Replace with your Facebook user ID
// api.addAdmin("0987654321");  // Add more admins as needed

// ===== PUBLIC FOLDERS =====

// Add additional public folders if needed
// api.addPublicFolder("uploads");
// api.addPublicFolder("downloads");

// ===== COMMAND REGISTRATION =====

// Register test command
api.addCommand("test", {
  title: "Test Command",
  command: "test",
  description: "Simple test command to verify bot functionality",
});

// Register music command (requires music.js in src folder)
api.addCommand("music", {
  title: "Music Player",
  command: "music ([\\w\\W]+)",
  description: "Download and play music from YouTube",
});

// Register echo command example
api.addCommand("echo", {
  title: "Echo Command",
  command: "echo ([\\w\\W]+)",
  description: "Repeats back what you say",
});

// Register AI chat command (unprefixed - works without prefix)
api.addCommand("ai", {
  title: "AI Chat",
  command: "ai ([\\w\\W]+)",
  unprefix: true,
  description: "Chat with AI assistant",
});

// Register help command (built-in, but you can override)
api.addCommand("help", {
  title: "Help Command",
  command: "help",
  description: "Shows all available commands",
});

// ===== FALLBACK COMMAND =====

// Set fallback for unmatched commands (optional)
// api.setFallback("ai", {
//   title: "AI Assistant"
// });

// ===== SERVER STARTUP =====

// Start the bot server with custom routes
api.listen((app) => {
  console.log("🤖 Facebook Page Bot is starting...");

  // Add custom API endpoints
  app.get("/api/status", (req, res) => {
    res.json({
      status: "online",
      bot_name: api.getAssistant(),
      commands_count: api.commands.length,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/commands", (req, res) => {
    const commands = api.commands.map((cmd) => ({
      title: cmd.title,
      command: cmd.command,
      description: cmd.description || "No description provided",
      hidden: cmd.hidden || false,
      maintenance: cmd.maintenance || false,
    }));

    res.json({
      prefix: api.prefix,
      commands: commands,
    });
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  console.log("✅ Custom API endpoints registered:");
  console.log("   - GET /api/status");
  console.log("   - GET /api/commands");
  console.log("   - GET /health");
});

// ===== ERROR HANDLING =====

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);

  // Notify admins about the error
  api.sendToAdmin(`🚨 System Error: ${error.message}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);

  // Notify admins about the error
  api.sendToAdmin(`🚨 Unhandled Promise Rejection: ${reason}`);
});

// ===== STARTUP MESSAGE =====

console.log("🚀 Facebook Page Bot Configuration Complete!");
console.log(`📝 Assistant Name: ${api.getAssistant()}`);
console.log(`🔧 Command Prefix: "${api.prefix}"`);
console.log(`📊 Registered Commands: ${api.commands.length}`);
console.log("⏳ Starting server...");

// Optional: Send startup notification to admins
setTimeout(() => {
  api.sendToAdmin(`🤖 ${api.getAssistant()} bot has started successfully!`);
}, 2000);
