from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models import EmployeeStatus, PaymentStatus

# Auth / User
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Department
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Position
class PositionBase(BaseModel):
    department_id: int
    title: str
    description: Optional[str] = None
    is_active: bool = True

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    department_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class PositionOut(PositionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    department: Optional[DepartmentOut] = None

    class Config:
        from_attributes = True

# Employee Document
class EmployeeDocumentOut(BaseModel):
    id: int
    employee_id: int
    document_type: str
    original_file_name: str
    stored_file_name: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_by: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Employee
class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: int
    position_id: int
    joining_date: str
    employment_type: str = "Full-Time"
    basic_salary: float = Field(ge=0)
    status: EmployeeStatus = EmployeeStatus.ACTIVE

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    joining_date: Optional[str] = None
    employment_type: Optional[str] = None
    basic_salary: Optional[float] = Field(default=None, ge=0)
    status: Optional[EmployeeStatus] = None

class EmployeeOut(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    department: Optional[DepartmentOut] = None
    position: Optional[PositionOut] = None

    class Config:
        from_attributes = True

# Payroll
class PayrollBase(BaseModel):
    employee_id: int
    month: int = Field(ge=1, le=12)
    year: int
    basic_salary: float = Field(ge=0)
    allowances: float = Field(default=0.0, ge=0)
    deductions: float = Field(default=0.0, ge=0)
    payment_status: PaymentStatus = PaymentStatus.PENDING

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    employee_id: Optional[int] = None
    month: Optional[int] = Field(default=None, ge=1, le=12)
    year: Optional[int] = None
    basic_salary: Optional[float] = Field(default=None, ge=0)
    allowances: Optional[float] = Field(default=None, ge=0)
    deductions: Optional[float] = Field(default=None, ge=0)
    payment_status: Optional[PaymentStatus] = None

class PayrollOut(PayrollBase):
    id: int
    net_salary: float
    created_at: datetime
    updated_at: datetime
    employee: Optional[EmployeeOut] = None

    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStatsOut(BaseModel):
    total_employees: int
    total_departments: int
    total_positions: int
    monthly_payroll_total: float
    pending_payrolls: int
    recent_employees: List[EmployeeOut]
