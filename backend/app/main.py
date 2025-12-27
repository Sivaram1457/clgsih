from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base

from .routers import auth, activities, academic, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Student Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(activities.router, prefix="/activities", tags=["Activities"])
app.include_router(academic.router, prefix="/academic", tags=["Academic"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/")

def root():

    return {"message": "Welcome to Smart Student Hub API"}