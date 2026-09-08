from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.models.user import User
from app.schemas.dns_record import (
    DNSRecordCreate,
    DNSRecordUpdate,
    DNSRecordResponse,
)


router = APIRouter(
    tags=["DNS Records"],
)


# CREATE DNS Record
@router.post(
    "/hosted-zones/{hosted_zone_id}/records",
    response_model=DNSRecordResponse,
)
def create_dns_record(
    hosted_zone_id: int,
    record: DNSRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check zone exists AND belongs to current user
    hosted_zone = (
        db.query(HostedZone)
        .filter(
            HostedZone.id == hosted_zone_id,
            HostedZone.user_id == current_user.id,
        )
        .first()
    )

    if not hosted_zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted Zone not found",
        )

    new_record = DNSRecord(
        hosted_zone_id=hosted_zone_id,
        name=record.name,
        record_type=record.record_type,
        value=record.value,
        ttl=record.ttl,
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


# GET DNS Records
@router.get(
    "/hosted-zones/{hosted_zone_id}/records",
    response_model=list[DNSRecordResponse],
)
def get_dns_records(
    hosted_zone_id: int,
    search: str | None = None,
    record_type: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check zone belongs to current user
    hosted_zone = (
        db.query(HostedZone)
        .filter(
            HostedZone.id == hosted_zone_id,
            HostedZone.user_id == current_user.id,
        )
        .first()
    )

    if not hosted_zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted Zone not found",
        )

    total_records = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == hosted_zone_id
    ).count()

    if total_records == 0:
        from app.routers.hosted_zones import seed_default_records
        seed_default_records(db, hosted_zone)

    query = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == hosted_zone_id
    )

    if search:
        query = query.filter(
            DNSRecord.name.ilike(f"%{search}%")
        )

    if record_type:
        query = query.filter(
            DNSRecord.record_type == record_type.upper()
        )

    offset = (page - 1) * limit

    records = (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )

    return records


# GET One DNS Record
@router.get(
    "/records/{record_id}",
    response_model=DNSRecordResponse,
)
def get_dns_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(DNSRecord)
        .join(HostedZone)
        .filter(
            DNSRecord.id == record_id,
            HostedZone.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS Record not found",
        )

    return record


# UPDATE DNS Record
@router.put(
    "/records/{record_id}",
    response_model=DNSRecordResponse,
)
def update_dns_record(
    record_id: int,
    record_data: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(DNSRecord)
        .join(HostedZone)
        .filter(
            DNSRecord.id == record_id,
            HostedZone.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS Record not found",
        )

    update_data = record_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    return record


# DELETE DNS Record
@router.delete("/records/{record_id}")
def delete_dns_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = (
        db.query(DNSRecord)
        .join(HostedZone)
        .filter(
            DNSRecord.id == record_id,
            HostedZone.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS Record not found",
        )

    if record.record_type in ("NS", "SOA"):
        zone_name = record.hosted_zone.name if record.hosted_zone else ""
        if record.name == zone_name or record.name == f"{zone_name}." or not record.name:
            raise HTTPException(
                status_code=400,
                detail=f"You can't delete the SOA record or the NS record named {zone_name}."
            )

    db.delete(record)
    db.commit()

    return {
        "message": "DNS Record deleted successfully"
    }