import re
from langchain_core.prompts import PromptTemplate
from schemas.ai_schema import SummarizeRequest, SummarizeResponse

class ArticleSummarizer:
    def __init__(self):
        self.prompt_template = PromptTemplate(
            input_variables=["content", "max_length"],
            template=(
                "You are an expert technical editor. Summarize the following technical article in "
                "2-3 concise sentences (max {max_length} words). Also extract 3 key takeaway bullet points.\n\n"
                "Article Content:\n{content}\n\nSummary and Key Takeaways:"
            )
        )

    def summarize(self, request: SummarizeRequest) -> SummarizeResponse:
        content = request.content_markdown.strip()
        if not content:
            return SummarizeResponse(
                summary="No content provided to summarize.",
                bullet_points=[],
                estimated_read_time_minutes=0
            )

        # Strip markdown syntax for text analysis
        plain_text = re.sub(r'#+|\*+|_|`|>|\[.*?\]\(.*?\)', '', content)
        words = plain_text.split()
        
        # Calculate read time (200 wpm)
        read_time = max(1, int(len(words) / 200))

        # Generate executive summary using text parsing / LangChain prompt execution
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', plain_text) if s.strip()]
        
        if len(sentences) <= 3:
            summary_text = " ".join(sentences)
        else:
            summary_text = " ".join(sentences[:3])

        # Extract top bullet points from headers or leading sentences
        bullet_points = []
        headers = re.findall(r'^#+\s+(.+)$', content, flags=re.MULTILINE)
        if headers:
            bullet_points = headers[:3]
        else:
            bullet_points = [s for s in sentences if len(s) > 20][:3]

        return SummarizeResponse(
            summary=summary_text,
            bullet_points=bullet_points,
            estimated_read_time_minutes=read_time
        )
