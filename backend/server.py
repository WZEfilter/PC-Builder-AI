from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import logging
import asyncio
from typing import Optional, List, Dict

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PC Builder AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
AFFILIATE_TAG_AMAZON = os.getenv("AFFILIATE_TAG_AMAZON", "your-affiliate-tag")

# Request models
class PCBuildRequest(BaseModel):
    budget: int
    use_case: str
    currency: str = "USD"
    additional_requirements: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# Response models
class PCComponent(BaseModel):
    name: str
    type: str
    price: float
    reason: str
    amazon_url: str

class PCBuildResponse(BaseModel):
    total_budget: int
    use_case: str
    components: List[PCComponent]
    total_price: float
    savings: float
    compatibility_notes: str

@app.get("/")
async def root():
    return {"message": "PC Builder AI API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "PC Builder AI API is running"}

async def call_openrouter_api(prompt: str, temperature: float = 0.7, max_tokens: int = 2048):
    """Call OpenRouter DeepSeek-R1 API with the given prompt"""
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling OpenRouter API (attempt {attempt + 1}/{max_retries}) with prompt length: {len(prompt)}")
            
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "deepseek/deepseek-r1-0528:free",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=60.0
                )
                
                logger.info(f"OpenRouter API status: {response.status_code}")
                
                if response.status_code != 200:
                    logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    raise HTTPException(status_code=500, detail="AI service unavailable")
                
                result = response.json()
                logger.info(f"OpenRouter response keys: {list(result.keys())}")
                
                # Check if the response contains an error
                if "error" in result:
                    error_msg = result["error"].get("message", "Unknown error")
                    logger.error(f"OpenRouter API returned error: {error_msg}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    raise HTTPException(status_code=500, detail=f"AI service error: {error_msg}")
                
                if "choices" not in result:
                    logger.error(f"Missing 'choices' in response: {result}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    raise HTTPException(status_code=500, detail="Invalid AI response format")
                
                message = result["choices"][0]["message"]
                logger.info(f"Message keys: {list(message.keys())}")
                
                # DeepSeek-R1 model returns reasoning in a separate field
                # Use reasoning if content is empty, otherwise use content
                content = message.get("content", "")
                reasoning = message.get("reasoning", "")
                
                logger.info(f"Content length: {len(content)}, Reasoning length: {len(reasoning)}")
                
                if not content and reasoning:
                    logger.info("Using reasoning field as response")
                    return reasoning
                elif content:
                    logger.info("Using content field as response")
                    return content
                else:
                    logger.warning("No content or reasoning found in response")
                    return "I apologize, but I couldn't generate a response. Please try again with a different question."
                
        except httpx.TimeoutException as e:
            logger.error(f"OpenRouter API timeout (attempt {attempt + 1}): {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            raise HTTPException(status_code=500, detail="AI service timeout - please try again")
        except httpx.RequestError as e:
            logger.error(f"OpenRouter API request error (attempt {attempt + 1}): {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            raise HTTPException(status_code=500, detail="AI service request error - please try again")
        except Exception as e:
            logger.error(f"Error calling OpenRouter API (attempt {attempt + 1}): {str(e)}")
            logger.error(f"Error type: {type(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable - please try again")

def create_pc_build_prompt(budget: int, use_case: str, currency: str = "USD", additional_requirements: str = None):
    """Create the prompt for PC build recommendation"""
    additional_text = f"\nAdditional requirements: {additional_requirements}" if additional_requirements else ""
    
    return f"""You are an expert PC builder assistant.
Your job is to:
1. Recommend an optimized PC build based on user's budget and use-case (gaming, streaming, editing, office, etc).
2. Choose high-performance and budget-balanced components (CPU, GPU, RAM, motherboard, PSU, SSD/HDD, case, cooling).
3. Ensure compatibility (e.g., socket match, power requirements).
4. Use actual product names that can be found on Amazon or PCPartPicker.
5. DO NOT invent parts that don't exist.
6. Structure your output clearly using markdown:
- Total Budget: ${budget}
- Purpose: {use_case}
- Final Build:
  - CPU: Intel Core i5-13400F
  - GPU: NVIDIA RTX 4060 8GB
  - ...
7. For each part, include: product name, reason for choice, approximate price, and Amazon product URL placeholder.
8. IMPORTANT: Wrap Amazon product links in this format:
  [Product Name](https://www.amazon.com/dp/PRODUCT_ID?tag={AFFILIATE_TAG_AMAZON})

Budget: ${budget} {currency}
Use Case: {use_case}{additional_text}

Please provide a detailed PC build recommendation."""

@app.post("/api/generate-build")
async def generate_pc_build(request: PCBuildRequest):
    """Generate PC build recommendation using OpenRouter AI"""
    try:
        logger.info(f"Generating PC build for budget: ${request.budget}, use case: {request.use_case}")
        
        # Create prompt
        prompt = create_pc_build_prompt(
            request.budget, 
            request.use_case, 
            request.currency, 
            request.additional_requirements
        )
        
        # Call OpenRouter API
        ai_response = await call_openrouter_api(prompt)
        
        # For now, return the AI response as-is
        # In a production version, you would parse this into structured data
        return {
            "success": True,
            "ai_response": ai_response,
            "budget": request.budget,
            "use_case": request.use_case,
            "currency": request.currency
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error generating PC build: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate PC build")

@app.post("/api/ask-ai")
async def ask_ai(request: ChatRequest):
    """Ask AI questions about PC components"""
    try:
        # Create a context-aware prompt for PC building questions
        context_prompt = f"""You are an expert PC builder assistant. Answer the user's question about PC components, compatibility, or building advice.

Question: {request.message}

Please provide a helpful, accurate response about PC building."""
        
        # Call OpenRouter API
        ai_response = await call_openrouter_api(context_prompt)
        
        return {
            "success": True,
            "response": ai_response,
            "session_id": request.session_id
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in ask AI: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get AI response")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)