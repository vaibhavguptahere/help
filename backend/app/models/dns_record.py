from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    hosted_zone_id: Mapped[int] = mapped_column(
        ForeignKey("hosted_zones.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    record_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    value: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )

    ttl: Mapped[int] = mapped_column(
        Integer,
        default=300
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationship with Hosted Zone
    hosted_zone = relationship(
        "HostedZone",
        back_populates="dns_records"
    )

    