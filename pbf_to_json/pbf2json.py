# python pbf_to_graph.py city.pbf dhaka.graph.json
import sys, json, math
import osmium as pyosmium

DRIVABLE = {
  "motorway","trunk","primary","secondary","tertiary","unclassified",
  "residential","service","living_street",
  "motorway_link","trunk_link","primary_link","secondary_link","tertiary_link"
}
DEFAULT_SPEED = {
  "motorway":90,"trunk":80,"primary":65,"secondary":55,"tertiary":45,
  "unclassified":40,"residential":35,"service":25,"living_street":15,
  "motorway_link":60,"trunk_link":50,"primary_link":45,"secondary_link":40,"tertiary_link":35
}

def parse_maxspeed(v, highway):
  if not v: return DEFAULT_SPEED.get(highway, 35)
  import re
  m = re.search(r'\d+', v)
  if not m: return DEFAULT_SPEED.get(highway, 35)
  n = int(m.group(0))
  if "mph" in v.lower(): n = round(n*1.60934)
  return n

def haversine(lat1, lon1, lat2, lon2):
  R=6371000
  from math import radians, sin, cos, asin, sqrt
  dLat=radians(lat2-lat1); dLon=radians(lon2-lon1)
  a=sin(dLat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dLon/2)**2
  return 2*R*asin(sqrt(a))

class GraphBuilder(pyosmium.SimpleHandler):
  def __init__(self):
    super().__init__()
    self.nodes = {}     # osm node id -> (lat, lon)
    self.keep_nodes = set()
    self.edges = []     # (aId, bId, lenM, speed, oneway, wayId)
    self.max_speed_kph = 0
  def node(self, n):
    self.nodes[n.id] = (n.location.lat, n.location.lon)
  def way(self, w):
    h = w.tags.get("highway")
    if h not in DRIVABLE: return
    oneway = 1 if (w.tags.get("oneway") in ["yes","1","true"] or h=="motorway") else 0
    speed = parse_maxspeed(w.tags.get("maxspeed"), h)

    if speed > self.max_speed_kph:
      self.max_speed_kph = speed


    refs = [nd.ref for nd in w.nodes]
    for i in range(len(refs)-1):
      a, b = refs[i], refs[i+1]
      if a in self.nodes and b in self.nodes:
        lat1, lon1 = self.nodes[a]; lat2, lon2 = self.nodes[b]
        L = haversine(lat1, lon1, lat2, lon2)
        self.edges.append((a,b,L,speed,oneway,str(w.id)))
        if not oneway:
          self.edges.append((b,a,L,speed,0,str(w.id)))

def main():
  if len(sys.argv)<3:
    print("Usage: python pbf_to_graph.py input.pbf output.json")
    sys.exit(1)
  IN, OUT = sys.argv[1], sys.argv[2]
  gb = GraphBuilder()
  gb.apply_file(IN, locations=True)

  # remap osm node ids to n1,n2... (compact ids)
  id_map = {}
  nodes_out = {}
  adj = {}
  next_id = 1
  def get_id(osm_id):
    nonlocal next_id
    if osm_id not in id_map:
      nid = f"n{next_id}"; next_id += 1
      id_map[osm_id] = nid
      lat, lon = gb.nodes[osm_id]
      nodes_out[nid] = [lat, lon]
      adj[nid] = []
    return id_map[osm_id]

  for a,b,L,speed,oneway,wayId in gb.edges:
    if a not in gb.nodes or b not in gb.nodes: continue
    A = get_id(a); B = get_id(b)
    adj[A].append([B, L, speed, oneway, wayId])

  out = { "meta": {"srid":4326}, "nodes": nodes_out, "adj": adj }

  out["meta"]["vmax_kph"] = gb.max_speed_kph
  out["meta"]["vmax_mps"] = gb.max_speed_kph * 1000 / 3600.0


  with open(OUT, "w") as f:
    json.dump(out, f)
  print(f"Wrote {OUT}")
  print(f"Max speed observed: {gb.max_speed_kph} km/h")

if __name__ == "__main__":
  print("working")
  main()
  print("worked")
