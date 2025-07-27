#!/usr/bin/env python3
"""
Production startup script for PC Builder AI Backend
"""

import os
import sys
import logging
import uvicorn
from startup import main as startup_main

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main production startup function"""
    try:
        # Run startup checks
        startup_main()
        
        # Start the server
        logger.info("Starting PC Builder AI Backend server...")
        
        # Get port from environment or use default
        port = int(os.getenv("PORT", 8001))
        host = os.getenv("HOST", "0.0.0.0")
        
        # Import the FastAPI app
        from server import app
        
        # Start uvicorn server
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()