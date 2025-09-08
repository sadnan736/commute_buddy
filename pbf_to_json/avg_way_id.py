import json
try:
    def average_wayid_length(json_path="C:\Drive\Uni\skill_dev\c471_proj\project_copy\FOR COMMit coppy\commute_buddy\dhaka.graph.json"):
        with open(json_path, "r") as f:
        
            way_lengths = {}
            seen_edges = set()
            graph = json.load(f)

            for A, edges in graph["adj"].items():
                for B, L, _speed, _oneway, wayId in edges:
                    # Unique undirected edge per wayId
                    key = (min(A, B), max(A, B), wayId)
                    if key in seen_edges:
                        continue
                    seen_edges.add(key)

                    way_lengths.setdefault(wayId, 0)
                    way_lengths[wayId] += L

            total_len = sum(way_lengths.values())
            avg_len = total_len / len(way_lengths) if way_lengths else 0
            return avg_len, len(way_lengths)
except:
    print("error")

# Example usage0
import os
print("---------------------------------")
print(os.getcwd())
print("---------------------------------")
avg_len, total_wayids = average_wayid_length("dhaka.graph.json")
print(f"Average wayId length: {avg_len:.2f} meters (across {total_wayids} wayIds)")
