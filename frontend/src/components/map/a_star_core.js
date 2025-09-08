// Haversine in meters
// {
//     "lat": 23.813243062951845,
//     "lng": 90.4067125289095
//      id: 752113690
//      nid = n174689
// }
//  n194969
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // m
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Find the closest nodeId in graph.nodes to a LatLng
export function nearestNodeId_core(graph, { lat, lng }) {
  let bestId = null;
  let bestDist = Infinity;
  // graph.nodes: { nodeId: [lat, lng], ... }
  for (const nid in graph.nodes) {
    const [nlat, nlng] = graph.nodes[nid];
    const d = haversine(lat, lng, nlat, nlng);
    if (d < bestDist) {
      bestDist = d;
      bestId = nid;
    }
  }
  return bestId;
}

//  cost = lengthMeters / (speedKph * 1000/3600) ETA RELATEWd
// h = crow_fly_distance / (max_assumed_speed_m_per_s)

// A* over the graph
//  graph.adj[fromId] = [ [toId, lengthMeters, speedKph, onewayFlag, wayId], ... ]
//  Returns: { nodePathIds: string[], coordsPath: [lat,lng][], distanceMeters, durationSec }

// graph.nodes = {
//   nodeId1: [lat, lng],
//   nodeId2: [lat, lng],
//   ...
// }

// graph.adj = {
//   fromNodeId: [
//     [toNodeId, lengthMeters, speedKph, onewayFlag, wayId],
//     ...
//   ],
//   ...
// }

 
export function aStarRoute_core(graph, startNodeId, goalNodeId, startLatLng, endLatLng) {
  console.log(startNodeId, goalNodeId)
  if (!startNodeId || !goalNodeId) {
    return { nodePathIds: [], coordsPath: [], distanceMeters: 0, durationSec: 0 };
  }

  // Heuristic: optimistic time using straight-line distance / 60km/h
  const heuristic = (nid) => {
    const [slat, slng] = graph.nodes[nid];
    const [glat, glng] = graph.nodes[goalNodeId];
    const d = haversine(slat, slng, glat, glng); // meters
    const assumedSpeedMps = 60_000 / 3600; // 60 km/h -> m/s
    return d / assumedSpeedMps; // seconds
  };

  // Cost so far (g), priority (f = g + h), and parent pointers
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();

  const openSet = new Set([startNodeId]);
  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, heuristic(startNodeId));

  // Simple function to pick node with lowest f in openSet
  const popBest = () => {
    let best = null;
    let bestF = Infinity;
    for (const nid of openSet) {
      const f = fScore.get(nid) ?? Infinity;
      if (f < bestF) { bestF = f; best = nid; }
    }
    if (best) openSet.delete(best);
    return best;
  };

  while (openSet.size) {
    const current = popBest();
    if (!current) break;
    if (current === goalNodeId) {
      // reconstruct
      const nodePathIds = [];
      let cur = current;
      while (cur) {
        nodePathIds.push(cur);
        cur = cameFrom.get(cur);
      }
      nodePathIds.reverse();

      // distance + duration along path
      let distanceMeters = 0;
      let durationSec = 0;
      for (let i = 0; i < nodePathIds.length - 1; i++) {
        const from = nodePathIds[i];
        const to = nodePathIds[i + 1];
        const edge = (graph.adj[from] || []).find(e => e[0] === to);
        if (edge) {
          const length = edge[1] || 0; // meters
          const speedKph = edge[2] || 30; // default fallback
          const speedMps = (speedKph * 1000) / 3600;
          distanceMeters += length;
          durationSec += speedMps > 0 ? (length / speedMps) : 0;
        } else {
          // if edge missing, approximate with straight-line
          const [lat1, lng1] = graph.nodes[from];
          const [lat2, lng2] = graph.nodes[to];
          const d = haversine(lat1, lng1, lat2, lng2);
          distanceMeters += d;
          durationSec += d / (50_000 / 3600); // 50 km/h fallback
        }
      }

      const coordsPath = nodePathIds.map(nid => graph.nodes[nid]);
      coordsPath[0] = [startLatLng.lat, startLatLng.lng]
      coordsPath[coordsPath.length-1] = [endLatLng.lat,endLatLng.lng]
      return { nodePathIds, coordsPath, distanceMeters, durationSec };
    }

    const neighbors = graph.adj[current] || [];
    for (const edge of neighbors) {
      const toId = edge[0];
      const length = edge[1] || 0; // meters
      const speedKph = edge[2] || 30;
      const speedMps = (speedKph * 1000) / 3600;
      const travelSec = speedMps > 0 ? (length / speedMps) : (length / (30_000 / 3600));

      const tentativeG = (gScore.get(current) ?? Infinity) + travelSec;

      if (tentativeG < (gScore.get(toId) ?? Infinity)) {
        cameFrom.set(toId, current);
        gScore.set(toId, tentativeG);
        fScore.set(toId, tentativeG + heuristic(toId));
        if (!openSet.has(toId)) openSet.add(toId);
      }
    }
  }

  // No route found
  return { nodePathIds: [], coordsPath: [], distanceMeters: 0, durationSec: 0 };
}

/**
 * High-level helper: get route from lat/lng to lat/lng.
 * - Finds nearest graph nodes to the given coords.
 */
export function computeRouteFromCoords_core(graph, startLatLng, endLatLng) {
  console.log("in astar ", startLatLng)
  const startNode = nearestNodeId_core(graph, startLatLng);
  console.log(startNode)
  const goalNode = nearestNodeId_core(graph, endLatLng);
  return aStarRoute_core(graph, startNode, goalNode, startLatLng, endLatLng);
}
