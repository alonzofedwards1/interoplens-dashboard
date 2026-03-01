from __future__ import annotations

from datetime import datetime, timedelta, timezone


def compute_cert_status(not_after: datetime | None) -> str:
    """Return a certificate lifecycle status for frontend display."""
    if not_after is None:
        return "Expired"

    now = datetime.now(timezone.utc)
    normalized_not_after = (
        not_after.replace(tzinfo=timezone.utc)
        if not_after.tzinfo is None
        else not_after.astimezone(timezone.utc)
    )

    if now > normalized_not_after:
        return "Expired"

    if normalized_not_after - now <= timedelta(days=30):
        return "Expiring Soon"

    return "Valid"
