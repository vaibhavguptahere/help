from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator


# Allowed DNS record types
DNSRecordType = Literal[
    "A",
    "AAAA",
    "CNAME",
    "TXT",
    "MX",
    "NS",
    "PTR",
    "SRV",
    "CAA",
]


# Data for creating a DNS Record
class DNSRecordCreate(BaseModel):
    name: str
    record_type: DNSRecordType
    value: str
    ttl: int = 300

    @field_validator("record_type", mode="before")
    @classmethod
    def convert_to_uppercase(cls, value):
        return value.upper() if isinstance(value, str) else value


# Data for updating a DNS Record
class DNSRecordUpdate(BaseModel):
    name: str | None = None
    record_type: DNSRecordType | None = None
    value: str | None = None
    ttl: int | None = None

    @field_validator("record_type", mode="before")
    @classmethod
    def convert_to_uppercase(cls, value):
        return value.upper() if isinstance(value, str) else value


# Data returned from API
class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    record_type: str
    value: str
    ttl: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)