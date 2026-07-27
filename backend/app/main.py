from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, departments, positions, employees, payrolls, dashboard


app = FastAPI(
    title="Simple HRM System API",
    description="Backend API for Simple HRM System hiring assessment",
    version="1.0.0",
)


origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(positions.router)
app.include_router(employees.router)
app.include_router(payrolls.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "HRM System API is running"}