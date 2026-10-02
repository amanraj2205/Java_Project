from fastapi import FastAPI

app = FastAPI(
    title="DevStream AI Microservice",
    description="Python LangChain microservice for text summarization and automatic technical tagging",
    version="1.0.0"
)

@app.get("/")
def health_check():
    return {"status": "online", "service": "DevStream AI Microservice"}
