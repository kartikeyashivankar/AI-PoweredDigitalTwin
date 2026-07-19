from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import route modules
from app.api.forecast import router as forecast_router
from app.api.whatif import router as whatif_router
from app.api.dashboard import router as dashboard_router

app = FastAPI(
    title="AI-Powered Climate Digital Twin API",
    description="Backend API for the Climate Digital Twin platform providing forecasting and simulator endpoints.",
    version="0.1.0"
)

# Enable CORS for frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://ai-powered-digital-twin.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under prefix '/api'
app.include_router(forecast_router, prefix="/api")
app.include_router(whatif_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Climate Digital Twin API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "climate-digital-twin-backend",
        "version": "0.1.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
