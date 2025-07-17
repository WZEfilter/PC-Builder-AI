#!/usr/bin/env python3
"""
Backend API Testing for PC Builder AI
Tests all backend endpoints and functionality
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "http://localhost:8001"

class BackendTester:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def log_result(self, test_name: str, passed: bool, message: str, details: Dict[Any, Any] = None):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()
        
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "details": details
        })
        
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def test_health_endpoint(self):
        """Test the /api/health endpoint"""
        try:
            response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result(
                        "Health Check Endpoint",
                        True,
                        "Health endpoint returns correct status",
                        {"status_code": response.status_code, "response": data}
                    )
                else:
                    self.log_result(
                        "Health Check Endpoint",
                        False,
                        "Health endpoint returns incorrect status",
                        {"status_code": response.status_code, "response": data}
                    )
            else:
                self.log_result(
                    "Health Check Endpoint",
                    False,
                    f"Health endpoint returned status code {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Health Check Endpoint",
                False,
                f"Failed to connect to health endpoint: {str(e)}",
                {"error": str(e)}
            )
    
    def test_generate_build_endpoint(self):
        """Test the /api/generate-build endpoint"""
        test_data = {
            "budget": 1000,
            "use_case": "gaming",
            "currency": "USD",
            "additional_requirements": "prefer NVIDIA graphics"
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/generate-build",
                json=test_data,
                timeout=60  # AI calls can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("ai_response"):
                    # Check if AI response contains relevant PC building content
                    ai_response = data.get("ai_response", "").lower()
                    has_pc_content = any(keyword in ai_response for keyword in [
                        "cpu", "gpu", "ram", "motherboard", "ssd", "hdd", "psu", "case"
                    ])
                    
                    if has_pc_content:
                        self.log_result(
                            "Generate Build Endpoint",
                            True,
                            "Build generation successful with relevant PC components",
                            {
                                "status_code": response.status_code,
                                "budget": data.get("budget"),
                                "use_case": data.get("use_case"),
                                "ai_response_length": len(data.get("ai_response", ""))
                            }
                        )
                    else:
                        self.log_result(
                            "Generate Build Endpoint",
                            False,
                            "AI response doesn't contain relevant PC building content",
                            {"status_code": response.status_code, "response": data}
                        )
                else:
                    self.log_result(
                        "Generate Build Endpoint",
                        False,
                        "Response missing success flag or ai_response",
                        {"status_code": response.status_code, "response": data}
                    )
            else:
                self.log_result(
                    "Generate Build Endpoint",
                    False,
                    f"Generate build endpoint returned status code {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Generate Build Endpoint",
                False,
                f"Failed to connect to generate build endpoint: {str(e)}",
                {"error": str(e)}
            )
    
    def test_ask_ai_endpoint(self):
        """Test the /api/ask-ai endpoint"""
        test_data = {
            "message": "What's the best GPU for 1080p gaming?",
            "session_id": "test-session-123"
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/ask-ai",
                json=test_data,
                timeout=60  # AI calls can take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("response"):
                    # Check if AI response is relevant to the question
                    ai_response = data.get("response", "").lower()
                    has_gpu_content = any(keyword in ai_response for keyword in [
                        "gpu", "graphics", "rtx", "gtx", "radeon", "1080p", "gaming"
                    ])
                    
                    if has_gpu_content:
                        self.log_result(
                            "Ask AI Endpoint",
                            True,
                            "Ask AI successful with relevant response",
                            {
                                "status_code": response.status_code,
                                "session_id": data.get("session_id"),
                                "response_length": len(data.get("response", ""))
                            }
                        )
                    else:
                        self.log_result(
                            "Ask AI Endpoint",
                            False,
                            "AI response doesn't seem relevant to GPU question",
                            {"status_code": response.status_code, "response": data}
                        )
                else:
                    self.log_result(
                        "Ask AI Endpoint",
                        False,
                        "Response missing success flag or response content",
                        {"status_code": response.status_code, "response": data}
                    )
            else:
                self.log_result(
                    "Ask AI Endpoint",
                    False,
                    f"Ask AI endpoint returned status code {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Ask AI Endpoint",
                False,
                f"Failed to connect to ask AI endpoint: {str(e)}",
                {"error": str(e)}
            )
    
    def test_cors_configuration(self):
        """Test CORS configuration"""
        try:
            # Test preflight request
            response = requests.options(
                f"{BACKEND_URL}/api/health",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "Content-Type"
                },
                timeout=10
            )
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            if response.status_code in [200, 204] and cors_headers["Access-Control-Allow-Origin"]:
                self.log_result(
                    "CORS Configuration",
                    True,
                    "CORS headers properly configured",
                    {"status_code": response.status_code, "cors_headers": cors_headers}
                )
            else:
                self.log_result(
                    "CORS Configuration",
                    False,
                    "CORS headers missing or incorrect",
                    {"status_code": response.status_code, "cors_headers": cors_headers}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "CORS Configuration",
                False,
                f"Failed to test CORS: {str(e)}",
                {"error": str(e)}
            )
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        # Test invalid JSON for generate-build
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/generate-build",
                json={"invalid": "data"},  # Missing required fields
                timeout=10
            )
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result(
                    "Error Handling - Invalid Build Request",
                    True,
                    "Properly handles invalid build request with 422 status",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "Error Handling - Invalid Build Request",
                    False,
                    f"Expected 422 for invalid request, got {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Error Handling - Invalid Build Request",
                False,
                f"Failed to test error handling: {str(e)}",
                {"error": str(e)}
            )
        
        # Test invalid JSON for ask-ai
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/ask-ai",
                json={},  # Missing required message field
                timeout=10
            )
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result(
                    "Error Handling - Invalid AI Request",
                    True,
                    "Properly handles invalid AI request with 422 status",
                    {"status_code": response.status_code}
                )
            else:
                self.log_result(
                    "Error Handling - Invalid AI Request",
                    False,
                    f"Expected 422 for invalid request, got {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Error Handling - Invalid AI Request",
                False,
                f"Failed to test error handling: {str(e)}",
                {"error": str(e)}
            )
    
    def test_deepseek_api_integration(self):
        """Test DeepSeek API integration by checking if responses are from AI"""
        test_data = {
            "budget": 800,
            "use_case": "office work",
            "currency": "USD"
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/generate-build",
                json=test_data,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data.get("ai_response", "")
                
                # Check if response looks like AI-generated content
                ai_indicators = [
                    len(ai_response) > 100,  # Substantial response
                    "cpu" in ai_response.lower() or "processor" in ai_response.lower(),
                    "budget" in ai_response.lower() or str(test_data["budget"]) in ai_response,
                    "office" in ai_response.lower() or "work" in ai_response.lower()
                ]
                
                if sum(ai_indicators) >= 3:
                    self.log_result(
                        "DeepSeek API Integration",
                        True,
                        "DeepSeek API integration working - generates relevant AI responses",
                        {
                            "response_length": len(ai_response),
                            "contains_budget": str(test_data["budget"]) in ai_response,
                            "contains_use_case": "office" in ai_response.lower()
                        }
                    )
                else:
                    self.log_result(
                        "DeepSeek API Integration",
                        False,
                        "DeepSeek API response doesn't seem AI-generated or relevant",
                        {"ai_response": ai_response[:200] + "..." if len(ai_response) > 200 else ai_response}
                    )
            else:
                self.log_result(
                    "DeepSeek API Integration",
                    False,
                    f"Failed to get response from DeepSeek API, status: {response.status_code}",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "DeepSeek API Integration",
                False,
                f"Failed to test DeepSeek API integration: {str(e)}",
                {"error": str(e)}
            )
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting PC Builder AI Backend Tests")
        print("=" * 50)
        print()
        
        # Test basic connectivity first
        self.test_health_endpoint()
        
        # Test CORS
        self.test_cors_configuration()
        
        # Test error handling
        self.test_error_handling()
        
        # Test AI endpoints (these take longer)
        self.test_generate_build_endpoint()
        self.test_ask_ai_endpoint()
        
        # Test DeepSeek integration specifically
        self.test_deepseek_api_integration()
        
        # Print summary
        print("=" * 50)
        print("🏁 TEST SUMMARY")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📊 Success Rate: {(self.passed / (self.passed + self.failed) * 100):.1f}%")
        
        return self.passed, self.failed, self.results

if __name__ == "__main__":
    tester = BackendTester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)