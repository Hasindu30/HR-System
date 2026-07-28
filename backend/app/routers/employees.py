import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import Employee, Department, Position, EmployeeDocument, User
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeDocumentOut
from app.dependencies.auth import get_current_user
from app.core.config import settings

router = APIRouter(tags=["Employees"])

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB  

@router.post("/employees", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Unique employee code
    existing_code = db.query(Employee).filter(Employee.employee_code == emp_in.employee_code).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Employee code must be unique")

    # Validate department
    dept = db.query(Department).filter(Department.id == emp_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    # Validate position
    pos = db.query(Position).filter(Position.id == emp_in.position_id).first()
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    if pos.department_id != emp_in.department_id:
        raise HTTPException(status_code=400, detail="Position does not belong to selected department")

    employee = Employee(**emp_in.dict())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return db.query(Employee).options(joinedload(Employee.department), joinedload(Employee.position)).filter(Employee.id == employee.id).first()

@router.get("/employees", response_model=List[EmployeeOut])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Employee).options(joinedload(Employee.department), joinedload(Employee.position)).all()

@router.get("/employees/{id}", response_model=EmployeeOut)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).options(joinedload(Employee.department), joinedload(Employee.position)).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.patch("/employees/{id}", response_model=EmployeeOut)
def update_employee(
    id: int,
    emp_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = emp_in.dict(exclude_unset=True)

    if "employee_code" in update_data and update_data["employee_code"] != emp.employee_code:
        existing_code = db.query(Employee).filter(Employee.employee_code == update_data["employee_code"]).first()
        if existing_code:
            raise HTTPException(status_code=400, detail="Employee code must be unique")

    dept_id = update_data.get("department_id", emp.department_id)
    pos_id = update_data.get("position_id", emp.position_id)

    if "department_id" in update_data:
        dept = db.query(Department).filter(Department.id == dept_id).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

    if "position_id" in update_data:
        pos = db.query(Position).filter(Position.id == pos_id).first()
        if not pos:
            raise HTTPException(status_code=404, detail="Position not found")

    pos = db.query(Position).filter(Position.id == pos_id).first()
    if pos and pos.department_id != dept_id:
        raise HTTPException(status_code=400, detail="Position does not belong to selected department")

    for field, value in update_data.items():
        setattr(emp, field, value)

    db.commit()
    db.refresh(emp)
    return db.query(Employee).options(joinedload(Employee.department), joinedload(Employee.position)).filter(Employee.id == id).first()

@router.delete("/employees/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return None

# Employee Document Endpoints

@router.post("/employees/{id}/documents", response_model=EmployeeDocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_employee_document(
    id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Extension validation
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed")

    # Content-type validation
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid MIME type: {file.content_type}")

    # Size validation & storage
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5 MB")

    unique_name = f"{uuid.uuid4()}{ext}"
    stored_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(stored_path, "wb") as f:
        f.write(contents)

    doc = EmployeeDocument(
        employee_id=id,
        document_type=document_type,
        original_file_name=file.filename,
        stored_file_name=unique_name,
        file_path=stored_path,
        file_size=len(contents),
        mime_type=file.content_type,
        uploaded_by=current_user.name
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/employees/{id}/documents", response_model=List[EmployeeDocumentOut])
def get_employee_documents(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db.query(EmployeeDocument).filter(EmployeeDocument.employee_id == id).all()

@router.get("/employees/documents/{document_id}/download")
def download_employee_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(EmployeeDocument).filter(EmployeeDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=doc.file_path,
        filename=doc.original_file_name,
        media_type=doc.mime_type
    )

@router.delete("/employees/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(EmployeeDocument).filter(EmployeeDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return None
