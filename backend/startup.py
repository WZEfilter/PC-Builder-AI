#!/usr/bin/env python3
"""
Startup script for PC Builder AI Backend
Handles initialization and health checks
"""

import os
import sys
import logging
from pymongo import MongoClient
import certifi

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = ['OPENROUTER_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    return True

def check_mongodb():
    """Check MongoDB connection"""
    try:
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/pc_builder_ai")
        
        if "mongodb+srv" in mongo_url:
            # MongoDB Atlas connection
            client = MongoClient(mongo_url, tlsCAFile=certifi.where())
        else:
            # Local MongoDB connection
            client = MongoClient(mongo_url)
        
        # Test connection
        client.admin.command('ping')
        logger.info("MongoDB connection successful")
        return True
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}")
        return False

def main():
    """Main startup function"""
    logger.info("Starting PC Builder AI Backend...")
    
    # Check environment variables
    if not check_environment():
        sys.exit(1)
    
    # Check MongoDB (non-blocking)
    check_mongodb()
    
    logger.info("Startup checks completed successfully")
    return True

if __name__ == "__main__":
    main()