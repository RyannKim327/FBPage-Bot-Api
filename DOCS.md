# Facebook Page Bot API Documentation
#### MPOP Reverse II (Ryann Kim Sesgundo)

> A comprehensive Facebook Messenger bot framework with modular command architecture

---

## 📁 **fbchat/** Directory

The `fbchat` directory contains the core Facebook Messenger bot framework implementation, providing a complete webhook-based chatbot system with Object-Oriented Programming principles.

### 📂 **Directory Structure**

```
fbchat/
├── index.js          # Main FacebookPage class implementation
└── web/
    └── index.html     # Landing page for the bot service
```

---

## 🏗️ **Core Class: FacebookPage**

The `FacebookPage` class is the heart of the bot framework, implementing all core functionality through a clean OOP interface.

### **Class Features**
- Express.js web server integration
- Facebook Graph API communication
- Command registration and processing
- File attachment handling
- Admin notification system
- Automatic help generation
- Message chunking for long texts
- Temporary file management

---

## ⚙️ **Installation & Setup**

### **1. Install Dependencies**
```bash
npm install express axios fs body-parser
```

### **2. Environment Variables**
Create a `.env` file or set environment variables:
```bash
FB_TOKEN=your_facebook_page_access_token
KEY_TOKEN=your_webhook_verification_token
PORT=3000
```

### **3. Facebook Developer Setup**
1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Messenger product to your app
3. Generate a Page Access Token
4. Configure webhook URL: `https://yourdomain.com/webhook`
5. Set webhook verification token
6. Subscribe to `messages` and `messaging_postbacks` events

---

## 🔧 **Public Methods**

### **Configuration Methods**

#### `setPrefix(prefix: string)`
Sets the command prefix for the bot.
```javascript
api.setPrefix("/");  // Commands will use / prefix
api.setPrefix("!");  // Commands will use ! prefix
```

#### `setAssistant(name: string)`
Sets the bot's assistant name displayed in help messages.
```javascript
api.setAssistant("AI Haibara");
```

#### `setWebhook(webhook: string)`
Configures the webhook endpoint path.
```javascript
api.setWebhook("/webhook");
```

#### `setAssetsFolder(assets: string)`
Sets the assets folder path for static files.
```javascript
api.setAssetsFolder("/assets");
```

#### `setTemporaryFolder(temp: string)`
Sets the temporary files folder path.
```javascript
api.setTemporaryFolder("/temp");
```

### **Command Management**

#### `addCommand(script: string, command: object)`
Registers a new command with the bot.

**Parameters:**
- `script`: Filename in `/src` directory (without .js extension)
- `command`: Command configuration object

**Command Object Properties:**
```javascript
{
  title: string,           // Command display name (required)
  command: string,         // Regex pattern for matching (required)
  description?: string,    // Optional description for help
  hidden?: boolean,        // Hide from help command
  unprefix?: boolean,      // Don't require prefix
  maintenance?: boolean,   // Mark as under maintenance
  any?: boolean           // Match anywhere in text
}
```

**Examples:**
```javascript
// Basic command
api.addCommand("hello", {
  title: "Hello Command",
  command: "hello",
  description: "Greets the user"
});

// Command with parameters
api.addCommand("music", {
  title: "Music Player",
  command: "music ([\\w\\W]+)",
  description: "Download and play music from YouTube"
});

// Unprefixed command (matches without prefix)
api.addCommand("ai", {
  title: "AI Chat",
  command: "ai ([\\w\\W]+)",
  unprefix: true,
  description: "Chat with AI assistant"
});
```

#### `setFallback(script: string, command: object)`
Sets a fallback command for unmatched inputs.
```javascript
api.setFallback("gpt", {
  title: "AI Assistant"
});
```

### **Admin Management**

#### `addAdmin(adminID: string)`
Adds a user ID to the admin list for notifications.
```javascript
api.addAdmin("1234567890");
api.addAdmin("0987654321");
```

### **File Management**

#### `addPublicFolder(folder: string)`
Exposes a folder as a public static directory.
```javascript
api.addPublicFolder("uploads");
api.addPublicFolder("downloads");
```

### **Messaging Methods**

#### `sendMessage(message: string|object, event: object, callback?: function)`
Sends a text message to the user.

**Features:**
- Automatic message chunking for long texts (>300 words)
- 1.5-second delay between chunks
- Error handling with callbacks

**Examples:**
```javascript
// Simple message
api.sendMessage("Hello, World!", event);

// With callback
api.sendMessage("Hello!", event, (error, response) => {
  if (error) {
    console.error("Failed to send message:", error);
  } else {
    console.log("Message sent successfully");
  }
});

// Long message (automatically chunked)
const longMessage = "This is a very long message that will be automatically split into chunks...";
api.sendMessage(longMessage, event);
```

#### `sendAttachment(fileType: string, fileUrl: string, event: object, callback?: function)`
Sends file attachments to users.

**Supported File Types:**
- `"audio"`: Audio files (audio/mpeg)
- `"image"`: Image files (image/png)  
- `"video"`: Video files (video/mp4)

**File Sources:**
- **Remote URLs**: Direct HTTP/HTTPS links
- **Local Files**: Files from assets or temp directories

**Examples:**
```javascript
// Remote file
api.sendAttachment("image", "https://example.com/image.jpg", event);

// Local file from assets
api.sendAttachment("audio", "/assets/music.mp3", event);

// Local file from temp
api.sendAttachment("video", "/temp/video.mp4", event);

// With callback
api.sendAttachment("image", "photo.jpg", event, (error, response) => {
  if (error) {
    console.error("Failed to send attachment:", error);
  }
});
```

#### `sendToAdmin(message: string|object, callback?: function)`
Sends messages to all registered admins.
```javascript
api.sendToAdmin("New user registered: " + event.sender.id);
api.sendToAdmin("System alert: High memory usage detected");
```

### **Utility Methods**

#### `getAssistant(): string`
Returns the current assistant name.
```javascript
const assistantName = api.getAssistant();
console.log(`Current assistant: ${assistantName}`);
```

### **Server Management**

#### `listen(callback?: function)`
Starts the Express.js server and webhook endpoints.

**Callback Parameter:**
The callback receives the Express app instance for custom route registration.

**Examples:**
```javascript
// Basic startup
api.listen();

// With custom routes
api.listen((app) => {
  // Add custom API endpoint
  app.get("/api/stats", (req, res) => {
    res.json({ 
      users: 100, 
      commands: api.commands.length 
    });
  });
  
  // File download endpoint
  app.get("/download/:file", (req, res) => {
    res.download(`./files/${req.params.file}`);
  });
});
```

---

## 📝 **Command Implementation**

Commands are implemented as separate modules in the `/src` directory.

### **Command Module Structure**
```javascript
// src/example.js
module.exports = (api, event, regex) => {
  // api: FacebookPage instance
  // event: Facebook message event object
  // regex: Matched regex pattern
  
  // Your command logic here
  api.sendMessage("Command executed!", event);
};
```

### **Command Examples**

#### **Simple Command**
```javascript
// src/hello.js
module.exports = (api, event, regex) => {
  api.sendMessage("Hello! How can I help you?", event);
};
```

#### **Command with Parameters**
```javascript
// src/echo.js
module.exports = (api, event, regex) => {
  const match = event.message.text.match(regex);
  const text = match[1]; // Extract parameter
  
  api.sendMessage(`You said: ${text}`, event);
};
```

#### **Advanced Command with File Handling**
```javascript
// src/download.js
const fs = require('fs');
const axios = require('axios');

module.exports = async (api, event, regex) => {
  try {
    const match = event.message.text.match(regex);
    const url = match[1];
    
    api.sendMessage("Downloading file...", event);
    
    // Download file
    const response = await axios.get(url, { responseType: 'stream' });
    const filename = `temp/download_${event.sender.id}.jpg`;
    
    const writer = fs.createWriteStream(filename);
    response.data.pipe(writer);
    
    writer.on('finish', () => {
      api.sendAttachment("image", filename, event, (error) => {
        if (!error) {
          // Clean up temp file
          fs.unlinkSync(filename);
        }
      });
    });
    
  } catch (error) {
    api.sendMessage("Failed to download file", event);
  }
};
```

---

## 🔄 **Webhook Endpoints**

The framework automatically sets up these endpoints:

- **GET `/`**: Landing page (serves `fbchat/web/index.html`)
- **GET `/webhook`**: Webhook verification endpoint
- **POST `/webhook`**: Message processing endpoint
- **Static Routes**: `/assets/*`, `/temp/*`, custom public folders

---

## ⚠️ **Error Handling**

### **Common Error Scenarios**

1. **Missing FB_TOKEN**: Bot will not start, all message operations fail
2. **Invalid Command Script**: Command registration fails, `start` flag set to false
3. **File Not Found**: Attachment sending fails with error callback
4. **Network Issues**: Facebook API calls may timeout or fail

### **Error Handling Patterns**

```javascript
// Always use callbacks for error handling
api.sendMessage("Hello", event, (error, response) => {
  if (error) {
    console.error("Message failed:", error);
    // Handle error (retry, log, notify admin)
  } else {
    console.log("Message sent successfully");
  }
});

// Validate before operations
if (!api.FB_TOKEN) {
  console.error("FB_TOKEN is required");
  return;
}
```

---

## 📋 **Best Practices**

### **Security**
- Store tokens in environment variables
- Validate webhook verification tokens
- Sanitize user inputs in command scripts
- Implement rate limiting for production use

### **Performance**
- Use callbacks for non-blocking operations
- Implement proper error handling
- Clean up temporary files regularly
- Monitor memory usage

### **Development**
- Test commands thoroughly before deployment
- Use descriptive command titles and descriptions
- Implement proper logging
- Follow consistent error handling patterns

### **File Management**
- Use temp folder for temporary files
- Use assets folder for permanent files
- Clean up files after sending attachments
- Implement file size limits

---

## 🚀 **Complete Usage Example**

See the sample files:
- `index.js` - Main application setup
- `src/example.js` - Sample command implementation

---

## 📚 **API Reference**

### **Event Object Structure**
```javascript
{
  sender: { id: "user_id" },
  recipient: { id: "page_id" },
  timestamp: 1234567890,
  message: {
    mid: "message_id",
    text: "user message text"
  }
}
```

### **Built-in Commands**
- `help`: Automatically generated help command listing all available commands

### **File Type Constants**
```javascript
api.types = {
  audio: "audio/mpeg",
  image: "image/png", 
  video: "video/mp4"
};
```

---

**Developer**: Ryann Kim Sesgundo [MPOP Reverse II]  
**Framework Version**: v23.0  
**Documentation**: Complete API Reference