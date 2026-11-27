"""Encuentra el QID de Wikidata de cada jugador/DT. Guarda tools/wikidata_ids.json."""
import json, os, sys, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from wikidata import search, entities, birth, occupations, by_titles, FOOT, COACH

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(os.path.dirname(__file__), "wikidata_ids.json")
players = json.load(open(f"{ROOT}/src/data/players.json"))
coaches = json.load(open(f"{ROOT}/src/data/coaches.json"))
careers = json.load(open(f"{ROOT}/src/data/careers.json"))
people = {}
for p in players: people[p["id"]] = {"name": p["name"], "birth": p.get("birthDate")}
for c in coaches: people.setdefault(c["id"], {"name": c["name"], "birth": c.get("birthDate")})
for c in careers: people.setdefault(c["id"], {"name": c["name"], "birth": None})
ids = {}
strip = lambda s: "".join(ch for ch in unicodedata.normalize("NFD", s) if unicodedata.category(ch) != "Mn")
def score_of(p, e):
    s, occ, b = 0, occupations(e), birth(e)
    if occ & {FOOT, COACH}: s += 5
    elif occ: s -= 5
    if p["birth"] and b:
        if b == p["birth"]: s += 6
        elif b[:4] == p["birth"][:4]: s += 3
        elif abs(int(b[:4]) - int(p["birth"][:4])) <= 1: s += 1
        else: s -= 3
    return s
# 1) Por título de Wikipedia, de a 50 (probando variantes con desambiguación).
names = sorted({p["name"] for p in people.values()})
births = {p["name"]: p["birth"] for p in people.values()}
hit = {}
VARIANTS = [("eswiki", "{}"), ("enwiki", "{}"), ("eswiki", "{} (futbolista)"), ("enwiki", "{} (footballer)"),
            ("eswiki", "{} (entrenador)"), ("enwiki", "{} (football manager)")]
for site, fmt in VARIANTS:
    todo = {fmt.format(n): n for n in names if n not in hit or score_of({"birth": births[n]}, hit[n]) < 5}
    got = by_titles(list(todo), site)
    for t_, e in got.items():
        n = todo.get(t_) or todo.get(t_.replace("_", " "))
        if n and (n not in hit or score_of({"birth": births[n]}, e) > score_of({"birth": births[n]}, hit[n])): hit[n] = e
    print(site, fmt, "→", len(hit), "de", len(names), flush=True)
# 2) El resto (o los que no son futbolistas): búsqueda.
for pid, p in people.items():
    e = hit.get(p["name"])
    best, score = (e["id"], score_of(p, e)) if e else (None, -99)
    if score < 3 and "--search" in sys.argv:
        qs = search(p["name"], "es") or search(strip(p["name"]), "en")
        ents = entities(qs)
        for k, q in enumerate(qs):
            if q in ents:
                s = score_of(p, ents[q]) - k * 0.3
                if s > score: best, score = q, s
    ids[pid] = {"qid": best if score >= 3 else None, "score": round(score, 1), "name": p["name"]}
json.dump(ids, open(OUT, "w"), ensure_ascii=False, indent=1)
print(len(ids), "personas;", sum(1 for v in ids.values() if v["qid"]), "encontradas")
print("sin encontrar:", [v["name"] for v in ids.values() if not v["qid"]])
print("dudosas (score<6):", [(v["name"], v["score"]) for v in ids.values() if v["qid"] and v["score"] < 6][:40])
