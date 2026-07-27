from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime
from app.database import get_db
from app.models import Employee, Department, Position, Payroll, PaymentStatus, User
from app.schemas import DashboardStatsOut
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_employees = db.query(Employee).count()
    total_departments = db.query(Department).count()
    total_positions = db.query(Position).count()

    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year

    monthly_payroll_total = db.query(func.sum(Payroll.net_salary)).filter(
        Payroll.month == current_month,
        Payroll.year == current_year
    ).scalar() or 0.0

    pending_payrolls = db.query(Payroll).filter(Payroll.payment_status == PaymentStatus.PENDING).count()

    recent_employees = db.query(Employee).options(
        joinedload(Employee.department),
        joinedload(Employee.position)
    ).order_by(Employee.created_at.desc()).limit(5).all()

    return {
        "total_employees": total_employees,
        "total_departments": total_departments,
        "total_positions": total_positions,
        "monthly_payroll_total": float(monthly_payroll_total),
        "pending_payrolls": pending_payrolls,
        "recent_employees": recent_employees
    }
