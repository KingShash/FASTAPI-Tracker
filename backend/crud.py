from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas


def get_items(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
) -> List[models.Item]:
    query = db.query(models.Item)
    if completed is not None:
        query = query.filter(models.Item.completed == completed)
    if priority is not None:
        query = query.filter(models.Item.priority == priority)
    return query.order_by(models.Item.created_at.desc()).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int) -> Optional[models.Item]:
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def create_item(db: Session, item: schemas.ItemCreate) -> models.Item:
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(
    db: Session, item_id: int, item: schemas.ItemUpdate
) -> Optional[models.Item]:
    db_item = get_item(db, item_id)
    if db_item is None:
        return None
    update_data = item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int) -> bool:
    db_item = get_item(db, item_id)
    if db_item is None:
        return False
    db.delete(db_item)
    db.commit()
    return True
