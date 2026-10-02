import re
from typing import List, Set
from langchain_core.prompts import PromptTemplate
from schemas.ai_schema import AutoTagRequest, AutoTagResponse

TECH_TAXONOMY = {
    "java": ["java", "spring", "spring boot", "hibernate", "jpa", "jvm", "maven", "gradle"],
    "python": ["python", "fastapi", "django", "flask", "pydantic", "pandas", "numpy"],
    "javascript": ["javascript", "js", "typescript", "ts", "react", "node", "express", "next.js", "vite"],
    "database": ["postgresql", "postgres", "mongodb", "mongo", "mysql", "sql", "nosql", "redis"],
    "devops": ["docker", "kubernetes", "k8s", "aws", "azure", "ci/cd", "git", "actions"],
    "architecture": ["microservices", "rest", "api", "graphql", "jwt", "auth", "security"],
    "ai": ["langchain", "llm", "openai", "ai", "machine learning", "rag", "fastapi"]
}

class AutoTagger:
    def __init__(self):
        self.prompt_template = PromptTemplate(
            input_variables=["title", "content"],
            template=(
                "Analyze the following technical article title and markdown content. Extract 3 to 6 relevant "
                "lowercase technical tags (e.g., #java, #react, #docker).\n\n"
                "Title: {title}\nContent: {content}\n\nTags:"
            )
        )

    def extract_tags(self, request: AutoTagRequest) -> AutoTagResponse:
        combined_text = f"{request.title} {request.content_markdown}".lower()
        extracted_tags: Set[str] = set()

        for category, keywords in TECH_TAXONOMY.items():
            for kw in keywords:
                pattern = r'\b' + re.escape(kw) + r'\b'
                if re.search(pattern, combined_text):
                    # Format as clean tag (e.g. spring-boot, react, postgresql)
                    tag_name = kw.replace(" ", "-")
                    extracted_tags.add(tag_name)

        if not extracted_tags:
            extracted_tags.add("general-tech")

        # Limit to top 6 tags
        final_tags = sorted(list(extracted_tags))[:6]
        return AutoTagResponse(tags=final_tags)
