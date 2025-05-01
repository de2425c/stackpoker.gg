from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from models import HandHistory
import google.genai as genai
import os

load_dotenv()

# Configure Gemini API

client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))



class LLMHandHistoryParser:
    def __init__(self):

        with open("system_prompt.txt", "r") as f:
            self.system_prompt = f.read()


    def parse_hand_history(self, description: str) -> Dict[str, Any]:
        try:
            prompt = f"{self.system_prompt}\n\nHand Description: {description}"
            
            # Generate response
            response = client.models.generate_content(
                model = 'gemini-2.0-flash',
                contents = prompt,
                config = {
                    'response_mime_type': 'application/json',
                    'response_schema': HandHistory
                }
            )
            # Parse the response
            import json

            hand_history = json.loads(response.text)
            return {"hand_history": hand_history['raw']}

                
        except Exception as e:
            raise Exception(f"Error parsing hand history: {str(e)}") 