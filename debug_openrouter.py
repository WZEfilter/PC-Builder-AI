#!/usr/bin/env python3
"""
Debug script to test OpenRouter API directly
"""
import httpx
import json
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test_openrouter():
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
            {"role": "user", "content": "Test message for PC build"}
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60.0
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Response JSON: {json.dumps(result, indent=2)}")
                
                if "choices" in result:
                    print(f"Content: {result['choices'][0]['message']['content']}")
                else:
                    print("No 'choices' key in response!")
                    print(f"Available keys: {list(result.keys())}")
            else:
                print(f"Error response: {response.text}")
                
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_openrouter())