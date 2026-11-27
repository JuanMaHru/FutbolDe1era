"""Datos para "Más o Menos" (higher or lower) desde Wikidata (en caché):
jugadores: altura, partidos y goles con la selección mayor, clubes en la carrera;
clubes: año de fundación y capacidad del estadio. Escribe src/data/hol.json."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import wikidata as wd
from clubnames import our_name, ROOT, known

ids = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_ids.json")))
players = {p["id"]: p for p in json.load(open(f"{ROOT}/src/data/players.json"))}
bios = json.load(open(f"{ROOT}/src/data/bios.json"))
raw = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_careers.json")))
pq = {pid: v["qid"] for pid, v in ids.items() if v["qid"] and pid in players and not players[pid].get("check")}
ents = wd.entities(list(pq.values()))

def amount(st):
    v = st["mainsnak"]["datavalue"]["value"]; a = float(v["amount"]); unit = v.get("unit", "")
    return a * 100 if unit.endswith("Q11573") else a  # metros → cm
NAT = re.compile(r"selecci[oó]n|national", re.I); YOUNG = re.compile(r"sub|under|u-?\d|olímp|olymp|juvenil|youth|\bB\b", re.I)
out_p = {}
teams_needed = set()
for pid, q in pq.items():
    e = ents.get(q)
    if not e: continue
    rec = {}
    h = wd._vals(e, "P2048")
    if h:
        try: rec["altura"] = round(amount(h[0][1]))
        except Exception: pass
    for tq, st in wd._vals(e, "P54"):
        teams_needed.add(tq)
    rec["_teams"] = [(tq, st) for tq, st in wd._vals(e, "P54")]
    out_p[pid] = rec
tents = wd.entities(sorted(teams_needed))
for pid, rec in out_p.items():
    caps = goals = None
    for tq, st in rec.pop("_teams"):
        te = tents.get(tq); l = wd.label(te, "es") if te else ""
        if not l or not NAT.search(l) or YOUNG.search(l): continue
        m, g = wd.qual(st, "P1350"), wd.qual(st, "P1351")
        if m: caps = max(caps or 0, int(float(m["amount"])) if isinstance(m, dict) else int(m))
        if g: goals = max(goals or 0, int(float(g["amount"])) if isinstance(g, dict) else int(g))
    if caps: rec["partidosSeleccion"] = caps
    if caps and goals is not None: rec["golesSeleccion"] = goals
    n = len({s["club"] for s in bios.get(pid, {}).get("career", [])})
    if n: rec["clubes"] = n
# Clubes: QID de cada club que usa el sitio (desde las trayectorias)
import collections
cnt = collections.defaultdict(collections.Counter)
for car in raw.values():
    for s in car:
        if re.search(r"(\bB$|\bII$|Castilla|Atl[eèé]tic\b|Sub-?\d|U-?\d\d|Reserva|Juvenil|Youth|Academy)", s["es"], re.I): continue
        cnt[our_name(s["es"], s.get("en"))][s["qid"]] += 1
club_q = {name: c.most_common(1)[0][0] for name, c in cnt.items()}
cents = wd.entities(sorted(set(club_q.values())))
stad = {}
out_c = {}
for name, q in club_q.items():
    e = cents.get(q)
    if not e: continue
    rec = {}
    inc = wd._vals(e, "P571")
    if inc:
        y = int(inc[0][0][1:5]) if isinstance(inc[0][0], str) else None
        if y and 1850 < y < 2026: rec["fundacion"] = y
    st = wd._vals(e, "P115")
    if st:
        # Estadio vigente: rango preferido, o el que no tiene fecha de fin.
        cur = [v for v, s in st if s.get("rank") == "preferred"] or [v for v, s in st if "P582" not in s.get("qualifiers", {})] or [st[-1][0]]
        rec["_st"] = cur[-1]; stad[name] = cur[-1]
    out_c[name] = rec
sents = wd.entities(sorted(set(stad.values())))
for name, rec in out_c.items():
    sq = rec.pop("_st", None)
    se = sents.get(sq) if sq else None
    if se:
        cap = wd._vals(se, "P1083")
        if cap:
            try: rec["capacidad"] = int(float(cap[-1][1]["mainsnak"]["datavalue"]["value"]["amount"]))
            except Exception: pass
        rec["estadio"] = wd.label(se, "es")
out_c = {k: v for k, v in out_c.items() if k in known and (v.get("fundacion") or v.get("capacidad"))}
json.dump({"players": out_p, "clubs": out_c}, open(f"{ROOT}/src/data/hol.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out_p), "jugadores;", sum(1 for v in out_p.values() if "altura" in v), "con altura;", sum(1 for v in out_p.values() if "partidosSeleccion" in v), "con partidos en selección")
print(len(out_c), "clubes;", sum(1 for v in out_c.values() if "capacidad" in v), "con estadio")
