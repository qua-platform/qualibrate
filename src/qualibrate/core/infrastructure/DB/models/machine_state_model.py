from sqlalchemy import Column, Integer, DateTime
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base


Base = declarative_base()
class MachineState(Base):
    __tablename__ = 'machine_state'


    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    content = Column(JSONB)


    def __repr__(self):
        return f"<QuamState(id={self.id}, created_at={self.created_at})>"
