<div align="center">
	<h1>Project Facebook</h1>
	<h3>Master Piece of Paper [Ryann Kim Sesgundo]</h3>
	<h5>v1.1.0</h5>

<img src="https://wakatime.com/badge/user/61954829-dd88-47de-8b67-7d673663ea1c/project/f0062889-91d0-4eaa-ad7e-2845a5b11dd1.svg" alt="wakatime">

A TypeScript-based tool for facebook automation like facebook posting and facebook messaging.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)

</div>

## File Structure

```mermaid
graph TD
    root["facebook-posting/"]
    root --> src["src/"]
    root --> docs["docs/"]
    root --> test["test/"]
    root --> package_json["package.json"]
    root --> env_d_ts["env.d.ts"]
    root --> env_sample[".env.sample"]
    root --> gitignore[".gitignore"]

    src --> index["index.ts (Main Entry)"]
    src --> interface["interface.ts (Types)"]
    src --> token_generator["token-generator.ts (Token Runner)"]
    src --> script["script/"]

    docs --> feed_doc["FEED.md (Feed Tutorial)"]
    docs --> msg_doc["MESSAGING.md (Messaging Tutorial)"]

    script --> two_hrs["two-hour-token.ts (2-Hour Token Management)"]
    script --> generator["token-generator.ts (Long-Lived Token)"]
    script --> posting["posting.ts (Posting Logic)"]
    script --> upload_media["upload-media.ts (Media Upload)"]
    script --> messaging["messaging/ (Messaging Logic)"]
```

## Tutorials

Detailed guides for each feature:
- [Facebook Feed Posting Tutorial](./docs/FEED.md)
- [Facebook Messenger Tutorial](./docs/MESSAGING.md)

## Dependencies

### Core
- **axios**: `^1.17.0` - For handling HTTP requests to the Facebook Graph API.
- **dotenv**: `^17.4.2` - For managing environment variables.

### Development
- **typescript**: `^6.0.3`
- **tsx**: Used for running the project directly in TypeScript.
- **ts-node**: `^10.9.2`
- **@types/node**: `^25.9.3`

## Configuration

1. Copy the sample environment file:
   ```bash
   cp .env.sample .env
   ```
2. Fill in the required variables in your `.env` file:
   - `APP_ID`: Your Facebook App ID.
   - `APP_SECRET`: Your Facebook App Secret.
   - `SHORT_TERM_TOKEN`: A short-lived user access token (see below).
   - `PAGE_ID`: The ID of the Facebook Page you want to post to.
   - `FEED_TOKEN`: Access token used for feed posting.
   - `MESSENGER_TOKEN`: Access token used for messaging.
   - `HOSTNAME`: Hostname used by the messaging module.

## How to Obtain Facebook Tokens

### 1. Short-Lived User Access Token (2 Hours)
1. Go to the [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. Select your App and the User you want to post as.
3. Add the following permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
4. Click **Generate Token**. This token usually lasts for 2 hours. Copy this to `SHORT_TERM_TOKEN` in your `.env`.

### 2. Long-Lived User Access Token (2 Months)
To generate a 60-day token, ensure `APP_ID`, `APP_SECRET`, and `SHORT_TERM_TOKEN` are set in your `.env` file. Then run:

```bash
npm run token
```
This script will exchange your short-lived token for a long-lived one, save it as `FB_TOKEN` in your `.env` file, and clear the value of `SHORT_TERM_TOKEN`.

### 3. Page Access Token
This project includes a `TwoHourToken` script (`src/script/two-hour-token.ts`) that automatically handles fetching the correct Page Access Token from the `/me/accounts` endpoint using your provided credentials.

## Contributing

Contributions are welcome! Please see [CONTRIBUTORS.md](./CONTRIBUTORS.md) for the list of contributors and guidelines on how to take part in this project.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the list of changes per version.

## License

This project is licensed under the [MIT License](./LICENSE.md).

## Credits

- **AI Assistance**: [ChatGPT](https://chatgpt.com) & [Gemini](https://gemini.google.com) & [OpenCode](https://opencode.ai/)
- **Developer**: Ryann Kim Sesgundo
