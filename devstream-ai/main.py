from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas.ai_schema import (
    SummarizeRequest,
    SummarizeResponse,
    AutoTagRequest,
    AutoTagResponse
)
from services.summarizer import ArticleSummarizer
from services.tagger import AutoTagger

app = FastAPI(
    title="DevStream AI Microservice",
    description="Python LangChain microservice for technical text summarization and automated tagging",
    version="1.0.0"
)

# Enable CORS for Spring Boot backend and React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

summarizer_service = ArticleSummarizer()
tagger_service = AutoTagger()

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "DevStream AI Microservice",
        "version": "1.0.0"
    }

@app.post("/api/v1/ai/summarize", response_model=SummarizeResponse, status_code=status.HTTP_200_OK)
def summarize_article(request: SummarizeRequest):
    try:
        return summarizer_service.summarize(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing text summarization: {str(e)}"
        )

@app.post("/api/v1/ai/auto-tag", response_model=AutoTagResponse, status_code=status.HTTP_200_OK)
def extract_auto_tags(request: AutoTagRequest):
    try:
        return tagger_service.extract_tags(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting article tags: {str(e)}"
        )
