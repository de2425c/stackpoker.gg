from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import os
import sys
from llm_parser import LLMHandHistoryParser

# Create FastAPI app
app = FastAPI(title="StackPoker Hand History Parser API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize parser
parser = LLMHandHistoryParser()

# Request model
class HandHistoryRequest(BaseModel):
    description: str

@app.get("/")
async def root():
    return {"message": "StackPoker.gg Hand History Parser API"}

@app.post("/parse-hand")
async def parse_hand_history(request: HandHistoryRequest):
    try:
        result = parser.parse_hand_history(request.description)
        return result.hand_history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# For debugging
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run the server if executed directly
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port) 