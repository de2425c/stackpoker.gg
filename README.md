# StackPoker.gg

A simple landing page for StackPoker.gg.

## Deployment Instructions

### Prerequisites
1. Install [Node.js](https://nodejs.org/)
2. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

### Firebase Setup and Deployment
1. Login to Firebase:
   ```
   firebase login
   ```

2. Initialize your project (You can use the existing files):
   ```
   firebase init
   ```
   - Select "Hosting" when prompted
   - Select "Use an existing project" or "Create a new project"
   - Use "." as the public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: No (optional)

3. Deploy to Firebase:
   ```
   firebase deploy
   ```

4. Your site will be live at `https://[YOUR-PROJECT-ID].web.app`

## Local Development
To test the site locally:
```
firebase serve
```

The site will be available at `http://localhost:5000`
