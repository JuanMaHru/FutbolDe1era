"""src/data/efemerides.json: cumpleaños (jugadores, DTs, leyendas) y fundación de clubes con fecha exacta, desde Wikidata (caché)."""
import json, os, sys, collections, re
sys.path.insert(0, os.path.dirname(__file__))
import wikidata as wd
from clubnames import our_name, ROOT, known

ids = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_ids.json")))
fame = json.load(open(f"{ROOT}/src/data/fame.json"))
ents = wd.entities([v["qid"] for v in ids.values() if v["qid"]])
# La fecha del juego manda (players/coaches); Wikidata solo completa a quien no la tiene (leyendas).
ours = {x["id"]: x.get("birthDate") for f in ("players", "coaches") for x in json.load(open(f"{ROOT}/src/data/{f}.json"))}
births = []
for pid, v in ids.items():
    e = ents.get(v["qid"]) if v["qid"] else None
    if not e: continue
    for val, st in wd._vals(e, "P569"):
        prec = st["mainsnak"]["datavalue"]["value"].get("precision")
        if prec == 11 and isinstance(val, str):
            births.append({"id": pid, "name": v["name"], "date": ours.get(pid) or val[1:11], "fame": fame.get(pid, 0)})
            break
# Clubes: QID más usado por nombre (como en build_hol)
raw = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_careers.json")))
cnt = collections.defaultdict(collections.Counter)
for car in raw.values():
    for s in car:
        if re.search(r"(\bB$|\bII$|Castilla|Atl[eèé]tic\b|Sub-?\d|U-?\d\d|Reserva|Juvenil|Youth|Academy)", s["es"], re.I): continue
        cnt[our_name(s["es"], s.get("en"))][s["qid"]] += 1
club_q = {n: c.most_common(1)[0][0] for n, c in cnt.items() if n in known}
cents = wd.entities(sorted(set(club_q.values())))
clubs = []
for name, q in club_q.items():
    e = cents.get(q)
    if not e: continue
    for val, st in wd._vals(e, "P571"):
        if st["mainsnak"]["datavalue"]["value"].get("precision") == 11 and isinstance(val, str):
            clubs.append({"club": name, "date": val[1:11]}); break
json.dump({"births": births, "clubs": clubs}, open(f"{ROOT}/src/data/efemerides.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(len(births), "cumpleaños;", len(clubs), "fundaciones con fecha exacta")
