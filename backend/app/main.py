from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal

# Import models
from app.models import User, HostedZone, DNSRecord

# Import routers
from app.routers import auth, hosted_zones, records


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Route53 Clone API",
)


# CORS configuration
import os

allowed_frontend = os.getenv("FRONTEND_URL", "")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if allowed_frontend:
    origins.append(allowed_frontend.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if allowed_frontend else ["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create default mock user
def create_default_user():
    db: Session = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == "demo@example.com")
            .first()
        )

        if not user:
            default_user = User(
                username="demo_user",
                email="demo@example.com",
                password="demo_password",
            )

            db.add(default_user)
            db.commit()

    finally:
        db.close()


create_default_user()


# Health check
@app.get("/health")
def health_check():
    return {
        "status": "Backend is running"
    }


# Include routers
app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(records.router)