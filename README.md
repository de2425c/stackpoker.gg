# StackPoker.gg

A landing page and hand history parser API for StackPoker.gg.

## Solution Overview

This project consists of:
1. A static landing page hosted on Firebase Hosting
2. A Firebase Cloud Function that handles API requests and provides a simulated response
3. (Future integration) A connection to a backend API for actual hand parsing with AI

## Firebase Deployment

### Prerequisites

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize your project (if not already done):
   ```
   firebase init
   ```
   - Select Hosting and Functions
   - Use existing project or create a new one
   - Accept defaults for other options

### Deploy

To deploy the landing page and API:

```
firebase deploy
```

This will deploy both the landing page and the Cloud Function API.

## Testing the API

You can test the API using curl:

```
curl -X POST https://stack-24dea.web.app/api/parse-hand \
  -H "Content-Type: application/json" \
  -d '{"description":"I am in a 6-max game with $1/$2 blinds..."}'
```

Or test the health endpoint:

```
curl https://stack-24dea.web.app/api/health
```

## iOS Integration

Your iOS app should already be configured to work with this API. It's using:

```swift
private let baseURL = "https://stack-24dea.web.app/api"
    
func parseHand(description: String) async throws -> ParsedHandHistory {
    guard let url = URL(string: "\(baseURL)/parse-hand") else {
        throw HandParserError.invalidURL
    }
    // ...rest of your code
}
```

This will connect to the Firebase Cloud Function we've set up.

## Future Enhancements

To integrate the real AI parser:

1. Deploy your Python FastAPI backend to a service like Google Cloud Run
2. Update the BACKEND_API_URL in the Cloud Function
3. Uncomment the axios call in the function that forwards requests

## Directory Structure

- `public/` - Static files for the landing page
- `functions/` - Firebase Cloud Functions for the API
- `parser_backend/` - Python FastAPI backend (for future integration)

## Tech Stack

- Frontend: HTML/CSS/JavaScript
- Main Server: Node.js with Express
- Backend API: Python with FastAPI
- AI: Google Gemini for hand history parsing

## Features

- Responsive landing page
- Hand history parsing API
- API test interface

## Deployment with Vercel

### Prerequisites

1. A Vercel account
2. Python 3.9+ and Node.js 18+ installed locally for development

### Deployment Steps

1. Push this code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Under "Build and Output Settings":
   - Build Command: `npm install && npm run install-python`
   - Output Directory: Leave default
6. Add Environment Variables:
   - `GOOGLE_API_KEY`: Your Google Gemini API key
7. Click "Deploy"

## Local Development

### Setup

1. Install Node.js dependencies:
   ```
   npm install
   ```

2. Install Python dependencies:
   ```
   npm run install-python
   ```

3. Start both servers:
   ```
   npm run start-all
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Testing the API

1. Navigate to [http://localhost:3000/api-test.html](http://localhost:3000/api-test.html)
2. Enter a poker hand history in the text area
3. Click "Parse Hand History"
4. View the JSON result

## API Endpoints

- `GET /api/health`: Check if the API is running
- `POST /api/parse-hand`: Parse a hand history (main endpoint for iOS app)
  - Request body: `{ "description": "your hand history here" }`
  - Response: JSON object with parsed hand history details
- `POST /api/parse`: Alternative endpoint that works the same way

## Project Structure

- `index.js` - Node.js Express server and proxy
- `public/` - Static frontend files
- `parser_backend/` - Python FastAPI backend
  - `main.py` - FastAPI server
  - `llm_parser.py` - Gemini AI parser
  - `models.py` - Pydantic models for the parser
  - `requirements.txt` - Python dependencies
  - `system_prompt.txt` - Prompt template for Gemini

## iOS App Integration

Your iOS app is already set up to connect to this API:

```swift
// Existing iOS code:
private let baseURL = "https://stack-24dea.web.app/api"

func parseHand(description: String) async throws -> ParsedHandHistory {
    guard let url = URL(string: "\(baseURL)/parse-hand") else {
        throw HandParserError.invalidURL
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body: [String: Any] = ["description": description]
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    
    // ... rest of your code ...
}
```

This code should work as-is with your new backend. 