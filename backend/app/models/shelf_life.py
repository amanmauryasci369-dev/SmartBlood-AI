from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base


class ComponentShelfLifeRule(Base):
    __tablename__ = "component_shelf_life_rules"

    id = Column(Integer, primary_key=True, index=True)
    component = Column(String, nullable=False, unique=True, index=True)
    storage_method = Column(String, nullable=False)
    shelf_life_value = Column(Integer, nullable=False)
    shelf_life_unit = Column(String, default="DAYS", nullable=False)
    regulatory_reference = Column(String, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
