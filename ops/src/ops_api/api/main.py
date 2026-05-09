from fastapi import FastAPI

app = FastAPI(title="OPS API")


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/webhooks/alertmanager")
async def alertmanager_webhook():
    return {"status": "received"}
