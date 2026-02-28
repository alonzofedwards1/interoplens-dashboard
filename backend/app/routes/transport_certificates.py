from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db import get_db_connection
from app.services.certificates import compute_cert_status

router = APIRouter(prefix="/api/transport", tags=["transport"])


class CertificateDetailsResponse(BaseModel):
    subject: str
    issuer: str
    thumbprint: str
    notBefore: str
    notAfter: str
    status: Literal["Valid", "Expiring Soon", "Expired"]
    detectedVia: Literal["Live Transaction", "Trust Metadata"]


TRANSPORT_CERTIFICATE_SQL = """
SELECT
    c.subject_cn,
    c.issuer_cn,
    c.fingerprint_sha1,
    c.not_before,
    c.not_after,
    o.source
FROM transport_events t
JOIN certificates c ON t.cert_id = c.cert_id
LEFT JOIN endpoint_cert_observations o ON c.cert_id = o.cert_id
WHERE t.transaction_id = %s
LIMIT 1;
"""


def _isoformat_or_empty(value: datetime | None) -> str:
    return value.isoformat() if value else ""


@router.get("/{transaction_id}/certificate", response_model=CertificateDetailsResponse)
def get_transport_certificate(
    transaction_id: str,
    db: Any = Depends(get_db_connection),
) -> CertificateDetailsResponse:
    with db.cursor() as cursor:
        cursor.execute(TRANSPORT_CERTIFICATE_SQL, (transaction_id,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Certificate not found for transaction")

    source = row.get("source")
    detected_via: Literal["Live Transaction", "Trust Metadata"] = (
        "Live Transaction" if source == "transaction" else "Trust Metadata"
    )

    not_after: datetime | None = row.get("not_after")
    status = compute_cert_status(not_after)

    return CertificateDetailsResponse(
        subject=row.get("subject_cn") or "",
        issuer=row.get("issuer_cn") or "",
        thumbprint=row.get("fingerprint_sha1") or "",
        notBefore=_isoformat_or_empty(row.get("not_before")),
        notAfter=_isoformat_or_empty(not_after),
        status=status,
        detectedVia=detected_via,
    )
