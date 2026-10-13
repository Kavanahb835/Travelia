from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.routes.package_routes import router as package_router
from app.routes.booking_routes import router as booking_router
from app.routes.auth_routes import router as auth_router
from app.routes.contact_routes import router as contact_router

app = FastAPI(
    title="Travel Agency API",
    description="Backend API for the Travel Agency website",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(package_router)
app.include_router(booking_router)
app.include_router(auth_router)
app.include_router(contact_router)


@app.get("/")
def root():
    return {
        "message": "Travel Agency API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/database-test")
def database_test():

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT 1")
        )

        value = result.scalar()

    return {
        "database": "connected",
        "test_result": value
    }