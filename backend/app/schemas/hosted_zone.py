from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Data sent when creating a Hosted Zone
class HostedZoneCreate(BaseModel):
    name: str
    description: str | None = None
    zone_type: str = "PUBLIC"


# Data sent when updating a Hosted Zone
class HostedZoneUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    zone_type: str | None = None


class HostedZoneResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None
    zone_type: str
    record_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)