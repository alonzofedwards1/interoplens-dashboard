import type {
    Oid,
    OidDetail,
    OidGovernanceAction,
} from "../../types";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "./auth";
import { safeJson } from "./utils";

const BASE = `${API_BASE_URL}/api/oids`;

/* ============================
   GET /api/oids
============================ */
export async function fetchOids(): Promise<Oid[]> {
    const res = await authFetch(BASE);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch OIDs");
    }

    const data = await safeJson(res);
    return Array.isArray(data) ? (data as Oid[]) : [];
}

/* ============================
   GET /api/oids/{oid}
============================ */
export async function fetchOidDetail(oid: string): Promise<OidDetail | null> {
    const res = await authFetch(`${BASE}/${encodeURIComponent(oid)}`);

    if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
            throw new Error(text || "OID not found.");
        }
        if (res.status === 400) {
            throw new Error(text || "Invalid OID request.");
        }
        throw new Error(text || "Failed to fetch OID detail");
    }

    const data = await safeJson(res);
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
    const res = await authFetch(
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

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "OID governance action failed");
    }
}
