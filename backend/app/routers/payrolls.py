from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import Payroll, Employee, User
from app.schemas import PayrollCreate, PayrollUpdate, PayrollOut
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/payrolls", tags=["Payrolls"])

@router.post("", response_model=PayrollOut, status_code=status.HTTP_201_CREATED)
def create_payroll(
    payroll_in: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == payroll_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    net_salary = payroll_in.basic_salary + payroll_in.allowances - payroll_in.deductions

    payroll = Payroll(
        employee_id=payroll_in.employee_id,
        month=payroll_in.month,
        year=payroll_in.year,
        basic_salary=payroll_in.basic_salary,
        allowances=payroll_in.allowances,
        deductions=payroll_in.deductions,
        net_salary=net_salary,
        payment_status=payroll_in.payment_status
    )

    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    return db.query(Payroll).options(joinedload(Payroll.employee)).filter(Payroll.id == payroll.id).first()

@router.get("", response_model=List[PayrollOut])
def get_payrolls(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Payroll).options(joinedload(Payroll.employee)).all()

@router.get("/{id}", response_model=PayrollOut)
def get_payroll(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payroll = db.query(Payroll).options(joinedload(Payroll.employee)).filter(Payroll.id == id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    return payroll

@router.patch("/{id}", response_model=PayrollOut)
def update_payroll(
    id: int,
    payroll_in: PayrollUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payroll = db.query(Payroll).filter(Payroll.id == id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")

    update_data = payroll_in.dict(exclude_unset=True)

    if "employee_id" in update_data:
        emp = db.query(Employee).filter(Employee.id == update_data["employee_id"]).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")

    for field, value in update_data.items():
        setattr(payroll, field, value)

    payroll.net_salary = payroll.basic_salary + payroll.allowances - payroll.deductions

    db.commit()
    db.refresh(payroll)
    return db.query(Payroll).options(joinedload(Payroll.employee)).filter(Payroll.id == id).first()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payroll(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payroll = db.query(Payroll).filter(Payroll.id == id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    db.delete(payroll)
    db.commit()
    return None
