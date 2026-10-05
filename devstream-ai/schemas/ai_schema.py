from pydantic import BaseModel, Field
from typing import List, Optional

class SummarizeRequest(BaseModel):
    content_markdown: str = Field(..., description="Raw Markdown article content to summarize")
    max_length: Optional[int] = Field(default=150, description="Maximum word count for summary")

class SummarizeResponse(BaseModel):
    summary: str = Field(..., description="Generated 2-3 sentence executive summary")
    bullet_points: List[str] = Field(default_factory=list, description="Key takeaway bullet points")
    estimated_read_time_minutes: int = Field(default=1, description="Calculated reading time")

class AutoTagRequest(BaseModel):
    content_markdown: str = Field(..., description="Raw Markdown content")
    title: Optional[str] = Field(default="", description="Article title")

class AutoTagResponse(BaseModel):
    tags: List[str] = Field(..., description="Extracted technical tags")

class CodeReviewRequest(BaseModel):
    code_content: str = Field(..., description="Code snippet or markdown article body to analyze")
    language: Optional[str] = Field(default="auto", description="Programming language context")

class CodeReviewResponse(BaseModel):
    review_summary: str = Field(..., description="Overview of code quality analysis")
    suggestions: List[str] = Field(default_factory=list, description="Actionable optimization suggestions")
    security_score: int = Field(default=95, description="Automated security & quality rating out of 100")
