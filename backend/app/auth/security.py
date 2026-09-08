from datetime import datetime, timedelta, timezone

from jose import jwt


SECRET_KEY = "route53_clone_secret_key_12345"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(data: dict):
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        hours=ACCESS_TOKEN_EXPIRE_HOURS
    )

    payload["exp"] = expire

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return token


def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except Exception:
        return None