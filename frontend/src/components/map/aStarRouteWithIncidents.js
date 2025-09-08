// incident_effects.js
export function effectFromReport({ type, severity }) {
  // defaults
  let factor = 1.0;
  let avoid = false;

  const sev = String(severity || "").toLowerCase();
  const typ = String(type || "").toLowerCase();

  if (typ === "congestion") {
    if (sev === "low")    factor = 1.2;
    else if (sev === "medium") factor = 1.6;
    else if (sev === "high")   factor = 2.5;
  } else if (typ === "accident") {
    if (sev === "low")    factor = 1.3;
    else if (sev === "medium") factor = 1.9;
    else if (sev === "high")   factor = 3.0;
  } else if (typ === "event") {
    if (sev === "low")    factor = 1.1;
    else if (sev === "medium") factor = 1.3;
    else if (sev === "high")   factor = 1.6;
  } else if (typ === "blockade") {
    // any severity blocks
    avoid = true;
    factor = Infinity;
  } else if (typ === "flood") {
    if (sev === "low")    factor = 1.4;
    else if (sev === "medium") factor = 2.0;
    else if (sev === "high") { avoid = true; factor = Infinity; }
  }

  return { factor, avoid };
}

// helper: ms left until expiry
export function msUntilExpiry(expiresAt) {
  return new Date(expiresAt).getTime() - Date.now();
}

export function updateIncidentStore(prevStore, newReports) {
  const prev = normalizeStore(prevStore);
  const list = Array.isArray(newReports) ? newReports : [];

  // 1) filter out expired from the incoming list
  const fresh = [];
  for (const r of list) {
    if (!r || !r.expiresAt) continue;
    if (msUntilExpiry(r.expiresAt) > 0) fresh.push(r);
  }

  const rptById = new Map(fresh.map(r => [r._id, r]));
  const newIds  = new Set(fresh.map(r => r._id));

  // 3) Start from previous store and prune sources that vanished/expired
  const byWayId = {};
  for (const wayId of Object.keys(prev.byWayId)) {
    const entry = prev.byWayId[wayId];
    // keep only sources that still exist and not expired
    const keptSources = (entry.sources || []).filter(id => {
      const rr = rptById.get(id);
      return rr && msUntilExpiry(rr.expiresAt) > 0;
    });

    if (keptSources.length === 0) {
      // drop this wayId entry for now; it may be re-added from fresh list below
      continue;
    }

    // recompute factor/avoid/expiresAt from the kept sources
    let factor = 1.0;
    let avoid  = false;
    let minExpires = Infinity;

    for (const id of keptSources) {
      const rr = rptById.get(id);
      const { factor: f, avoid: a } = effectFromReport(rr);
      factor = Math.max(factor, f);
      avoid = avoid || a;
      const expMs = new Date(rr.expiresAt).getTime();
      if (expMs < minExpires) minExpires = expMs;
    }

    byWayId[wayId] = {
      wayId,
      factor,
      avoid,
      sources: keptSources.slice(),
      expiresAt: minExpires === Infinity ? Date.now() : minExpires,
    };
  }

  // 4) Fold in the fresh list (some wayIds may be totally new; existing ones will be upgraded)
  for (const r of fresh) {
    if (!r.wayId) continue;
    const w = r.wayId;
    const { factor: f, avoid: a } = effectFromReport(r);
    const expMs = new Date(r.expiresAt).getTime();

    if (!byWayId[w]) {
      byWayId[w] = {
        wayId: w,
        factor: Math.max(1.0, f),
        avoid: !!a,
        sources: [r._id],
        expiresAt: expMs,
      };
    } else {
      byWayId[w].factor = Math.max(byWayId[w].factor, f);
      byWayId[w].avoid  = byWayId[w].avoid || a;
      byWayId[w].expiresAt = Math.min(byWayId[w].expiresAt, expMs);
      if (!byWayId[w].sources.includes(r._id)) byWayId[w].sources.push(r._id);
    }
  }

  return {
    byWayId,
    lastUpdated: Date.now(),
  };
}

function normalizeStore(s) {
  if (!s || typeof s !== "object") {
    return { byWayId: {}, lastUpdated: 0 };
  }
  if (!s.byWayId || typeof s.byWayId !== "object") {
    return { byWayId: {}, lastUpdated: Number(s.lastUpdated) || 0 };
  }
  return { byWayId: { ...s.byWayId }, lastUpdated: Number(s.lastUpdated) || 0 };
}