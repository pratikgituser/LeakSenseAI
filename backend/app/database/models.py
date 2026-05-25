from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.session import Base

class NodeRecord(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, unique=True, index=True)
    city = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    base_pressure = Column(Float)

class LeakEvent(Base):
    """The Audit Trail for our White & Blue Dashboard"""
    __tablename__ = "leak_events"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, ForeignKey("nodes.node_id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    severity = Column(String) # LOW, MEDIUM, HIGH, CRITICAL
    leak_type = Column(String) # PREDICTED, ACTUAL
    pressure_val = Column(Float)
    flow_val = Column(Float)
    status = Column(String, default="OPEN") # OPEN, RESOLVED