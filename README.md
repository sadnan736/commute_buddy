# 🚦 CommuteBuddy

> Community‑powered, disaster‑aware routing for Dhaka. Avoid floods, accidents, and blockades with live reports + a custom A\* router.

**Live demo:** [https://commute-buddy-three.vercel.app/](https://commute-buddy-three.vercel.app/)

## Table of contents

* [What is it?](#-what-is-it)
* [Features](#-features)
* [Architecture](#%EF%B8%8F-architecture)
* [Data model (MongoDB)](#-data-model-mongodb)
* [Routing engine](#-routing-engine)
* [API overview (Express)](#-api-overview-express)
* [Project structure](#-project-structure)
* [Setup](#-setup)
* [Using the app](#%EF%B8%8F-using-the-app)
* [Public repo hygiene](#-public-repo-hygiene)
* [Roadmap](#%EF%B8%8F-roadmap)
* [Contributing](#-contributing)
* [License](#-license)
* [Acknowledgements](#-acknowledgements)

---

## ✨ What is it?

CommuteBuddy is a MERN application that lets commuters **see and report real‑time incidents** and **get routes that adapt** to those conditions. The map snaps clicks to the nearest road, saved places are remembered, and the routing engine factors in active reports to compute a realistic ETA.

A few design goals:

* **Simple, readable UI** for everyday commuters.
* **Accurate road‑level placement** by snapping to OSM ways.
* **Trust through expiry & voting** so stale or low‑quality reports fade out.
* **Public‑repo friendly**: no secrets, env‑driven config, OSM attribution.

---

## 🧭 Features

* **Incidents‑aware A\***: A\* minimizes time using edge length/speed, then **skips or penalizes edges** with active incidents.
* **Create & view reports**: type, severity, validity (auto‑expire), description, optional photo.
* **Vote on reports**: up/down voting for credibility.
* **Save places**: store `{lat, lng, wayId}` for Home/Office etc.; use them as Start or Destination quickly.
* **ETA & route preview**: pick Start/Destination via an always‑visible menu, then compute ETA; route is drawn on the map.
* **Role‑based** (current scope): **General User** and **Admin** (moderation tools).
* **Notifications**: server utilities and endpoints for notifying about disruptions (see `utils/notifications.js`).

> Markers: blue (selection), yellow (incidents), red (Start/Destination with custom `ETA_marker`).

---

## 🛠️ Architecture

**Frontend:** React (Vite), Tailwind/CSS, Leaflet, OSM tiles
**Backend:** Node.js (Express), MongoDB
**Preprocessing:** Python + `osmium` → `dhaka.graph.json`

Front‑end loads the road graph, manages Start/Destination flow, polls for reports, and renders both **raw reports** and the **derived incident index** used by routing.

---

## 🧱 Data model (MongoDB)

**Report**

```js
{
  _id,
  type,                // e.g., flood, accident, blockade
  severity,            // enum/number
  validity,            // minutes
  expiresAt,           // Date (TTL)
  reportedBy,          // name
  reportedByUID,       // user id
  location: { lat, lng },
  description,
  photoUrl?,
  wayId,               // snapped road segment id
  votes: { upvotes, downvotes },
  votedUsers: [userId]
}
```

**Saved place**: `{ locationName, lat, lng, wayId }`

**User (excerpt)**: `{ name, email, passwordHash, role, savedPlaces: Map<string, {lat,lng,wayId}> }`

---

## 🧮 Routing engine

**Graph format**

```js
// nodes: { nodeId: [lat, lng] }
// adj[fromId] = [ [toId, lengthMeters, speedKph, onewayFlag, wayId], ... ]
```

**Cost** = travel time (meters / m/s).
**Heuristic** = straight‑line / 60 km/h (conservative & admissible).

**Incidents index (derived client‑side from active reports)**

* `avoidWayIds: Set<wayId>` – hard blocks (skip edges entirely).
* `slowdownsByWayId: Map<wayId, factorOrSpeed>` – soft penalties / overrides.

**Integration**

* If `edge.wayId ∈ avoidWayIds` → skip neighbor.
* Else scale travel time by slowdown.
* Heuristic stays conservative so A\* remains optimal.

**Spatial equivalence note**
Way equality alone is too coarse (adjacent segments may split at \~200m). We **snap to polylines** and use a **distance threshold** across neighboring wayIds when comparing proximity.

---

## 🌐 API overview (Express)

> Route names evolve; see source under `Backend/routes/`. Examples below reflect the current usage patterns.

**Auth & users (`userRoutes.js`)**

```
POST   /api/post                 # register user
GET    /api/get                  # login user
GET    /api/users/:id/name       # fetch display name (auth)
```

**Reports (`report_routes.js`)**

```
GET    /api/reports?activeOnly=true|false&sort=createdAt|expiresAt  # list
POST   /api/reports                                                  # create
/* Admin endpoints exist for moderation in `adminRoutes.js` */
```

**Report votes (`reportVotes.js`)**

```
POST   /api/reports/:id/votes/up
POST   /api/reports/:id/votes/down
```

**Map & saved places (`map_routes.js`)**

```
POST   /api/:id/saved-places  # body: { locationName, lat, lng, wayId }
DELETE /api/:id/saved-places/:locationName
```

**Notifications (`notificationRoutes.js`)**
Endpoints for creating/listing user notifications (see code for details).

---

## 📦 Project structure

```
Backend/
  middleware/ (auth, authorize)
  models/ (notification, reports, users)
  routes/ (adminRoutes, map_routes, notificationRoutes, report_routes, reportVotes, userRoutes)
  uploads/ (user/report images)
  utils/notifications.js
  server.js

frontend/
  public/images/ (map marker assets)
  src/assets/ (CSS + graph/dhaka.graph.json)
  src/components/map/ (A*, incidents, map, notifications, votes)
  App.jsx, main.jsx, pages

pbf_to_json/ (OSM → JSON tools)
  pbf2json.py, avg_way_id.py, dhaka.graph.json (sample), city.pbf (example)
```

---

## 🔧 Setup

### Prereqs

* Node.js 18+
* MongoDB (local or Atlas)
* Python 3.10+ with `osmium` (for OSM processing)

### 1) Backend

```bash
cd Backend
npm install
cp .env.example .env   # create your env file if provided
# .env
# MONGO_URI=mongodb://localhost:27017/commutebuddy
# JWT_SECRET=replace_me
# PORT=1477
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
# .env
# VITE_API_URL=http://localhost:1477/api
npm run dev
```

### 3) Build the road graph (optional if a JSON is already provided)

```bash
cd pbf_to_json
python pbf2json.py city.pbf dhaka.graph.json
# sanity check: average edge length
python avg_way_id.py dhaka.graph.json
```

Copy `dhaka.graph.json` where the frontend expects it (e.g., `frontend/src/assets/graph/`).

---

## ▶️ Using the app

1. **Register** → **Login**.
2. Open the **Map**.
3. Click to place a marker (auto‑snapped to road).
   – Optionally **Save location** (Home/Office) → stored as `{lat, lng, wayId}`.
4. Use **Choose → Start/Destination** to place red markers (map or saved places).
5. Click **Calculate ETA** to run incidents‑aware A\* and draw the route.
6. **Create a report** (type, severity, validity, description/photo).
   – Yellow markers appear; click once for summary, double‑click for details.
7. **Vote** on reports to improve credibility.
8. Admins: review/manage content from admin routes.

---

---

## 🔒 Public repo hygiene

* Keep secrets in **.env**, never commit tokens or DB creds.
* Uploaded images under `Backend/uploads/` are demo assets; scrub PII before publishing.
* Respect **OSM attribution** for map/tiles/data.

---

## 🗺️ Roadmap

* Move incidents processing + A\* into a Web Worker.
* Hysteresis to avoid reroute flapping on small changes.
* Adjacency spillover penalties to neighboring segments.
* Push notifications for disruptions on saved routes.
* Socket streaming for real‑time report updates.
* Offline caching of the road graph.

---

## 🤝 Contributing

PRs welcome! Please describe changes clearly, include repro steps or tests, and be mindful of performance in hot paths (graph ops, routing).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

* OpenStreetMap contributors
* Leaflet
* osmium / PyOsmium
