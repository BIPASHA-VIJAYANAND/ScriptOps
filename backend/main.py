"""
FastAPI Application — Script Intelligence & Risk Analysis System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Explicitly load backend/.env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

app = FastAPI(
    title="Script Intelligence API",
    description="AI-Powered Script Intelligence & Risk Analysis System",
    version="1.0.0",
)

# CORS — allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
from api.routes import router as api_router
from .api.auth import router as auth_router
app.include_router(api_router)
app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "name": "Script Intelligence API",
        "version": "1.0.0",
        "docs": "/docs",
    }
