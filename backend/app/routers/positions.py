from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models import Position, Department, User
from app.schemas import PositionCreate, PositionUpdate, PositionOut
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/positions", tags=["Positions"])

@router.post("", response_model=PositionOut, status_code=status.HTTP_201_CREATED)
def create_position(
    pos_in: PositionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(Department).filter(Department.id == pos_in.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
        
    position = Position(**pos_in.dict())
    db.add(position)
    db.commit()
    db.refresh(position)
    return position

@router.get("", response_model=List[PositionOut])
def get_positions(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Position).options(joinedload(Position.department))
    if department_id is not None:
        query = query.filter(Position.department_id == department_id)
    return query.all()

@router.get("/{id}", response_model=PositionOut)
def get_position(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    position = db.query(Position).options(joinedload(Position.department)).filter(Position.id == id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    return position

@router.patch("/{id}", response_model=PositionOut)
def update_position(
    id: int,
    pos_in: PositionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    position = db.query(Position).filter(Position.id == id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
        
    update_data = pos_in.dict(exclude_unset=True)
    if "department_id" in update_data:
        department = db.query(Department).filter(Department.id == update_data["department_id"]).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

    for field, value in update_data.items():
        setattr(position, field, value)
        
    db.commit()
    db.refresh(position)
    return position

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_position(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    position = db.query(Position).filter(Position.id == id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    db.delete(position)
    db.commit()
    return None
