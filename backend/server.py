from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
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

# Initialize OpenAI client for OpenRouter
openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

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
    """Call OpenRouter DeepSeek API using OpenAI client"""
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling OpenRouter API (attempt {attempt + 1}/{max_retries}) with prompt length: {len(prompt)}")
            
            completion = openai_client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://pcbuilderai.emergent.com",
                    "X-Title": "PC Builder AI",
                },
                extra_body={},
                model="deepseek/deepseek-chat",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            logger.info("OpenRouter API call successful")
            
            # Extract the response content
            if completion.choices and len(completion.choices) > 0:
                message = completion.choices[0].message
                
                # For regular DeepSeek models, use content field directly
                content = message.content if message.content else ""
                
                logger.info(f"Content length: {len(content)}")
                
                if content and content.strip():
                    logger.info("Using content field as response")
                    return content
                else:
                    logger.warning("No content found in response")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    return "I apologize, but I couldn't generate a response. Please try again with a different question."
            else:
                logger.error("No choices in completion response")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
                raise HTTPException(status_code=500, detail="Invalid AI response format")
                
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
    
    return f"""You are an expert PC builder assistant. Create a detailed PC build recommendation.

REQUIREMENTS:
- Budget: ${budget} {currency}
- Use case: {use_case}
- Be specific with actual product names and current pricing{additional_text}

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

# ${budget} {use_case.title()} PC Build

## Components:

**CPU**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

**GPU**: [Product Name] - $[price] 
*Reason: [brief reason for choice]*

**Motherboard**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

**RAM**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

**Storage**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

**PSU**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

**Case**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

**Cooling**: [Product Name] - $[price]
*Reason: [brief reason for choice]*

## Build Summary:
- **Total Cost**: $[total]
- **Performance**: [brief performance summary]
- **Upgrade Path**: [brief upgrade suggestions]

## Amazon Links:
- CPU: [Product Name](https://www.amazon.com/dp/PRODUCT_ID?tag={AFFILIATE_TAG_AMAZON})
- GPU: [Product Name](https://www.amazon.com/dp/PRODUCT_ID?tag={AFFILIATE_TAG_AMAZON})
- [Continue for all components...]

Use real, current products available on Amazon. Ensure total stays within budget."""

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