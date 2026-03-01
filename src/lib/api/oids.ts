import type {
    Oid,
    OidDetail,
    OidGovernanceAction,
} from "../../types";
import { requestJson, requestOk } from "./request";
import { API_BASE } from '../apiBase';

const BASE = `${API_BASE}/api/oids`;

/* ============================
   GET /api/oids
============================ */
export async function fetchOids(): Promise<Oid[]> {
    const data = await requestJson<unknown>(BASE);
    return Array.isArray(data) ? (data as Oid[]) : [];
}

/* ============================
   GET /api/oids/{oid}
============================ */
export async function fetchOidDetail(oid: string): Promise<OidDetail | null> {
    const data = await requestJson<unknown>(
        `${BASE}/${encodeURIComponent(oid)}`
    );
    if (!data || typeof data !== "object") {
        return null;
    }
    return data as OidDetail;
}

/* ============================
   POST /api/oids/{oid}/governance
   🔐 Requires X-Role header
============================ */
export async function submitOidGovernance(
    oid: string,
    action: OidGovernanceAction
): Promise<void> {
    await requestOk(
        `${BASE}/${encodeURIComponent(oid)}/governance`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

                // ✅ REQUIRED BY BACKEND AUTH
                // Matches:
                // x_role: str | None = Header(None, alias="X-Role")
                "X-Role": "admin",        // or "committee" in prod
                "X-Reviewer": "dev-user"  // optional, but logged
            },
            body: JSON.stringify({ action }),
        }
    );
}
