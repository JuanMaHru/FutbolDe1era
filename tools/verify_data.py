"""Compara players/coaches/careers con Wikidata y escribe tools/verify_report.json + un resumen."""
import json, os, re, sys, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from wikidata import entities, profile, label, _vals

ROOT = os.path.join(os.path.dirname(__file__), "..")
players = json.load(open(f"{ROOT}/src/data/players.json"))
coaches = json.load(open(f"{ROOT}/src/data/coaches.json"))
careers = json.load(open(f"{ROOT}/src/data/careers.json"))
ids = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_ids.json")))

qids = [v["qid"] for v in ids.values() if v["qid"]]
ents = entities(qids)
prof = {q: profile(e) for q, e in ents.items()}
team_q = {t["qid"] for p in prof.values() for t in p["teams"]}
country_q = {c for p in prof.values() for c in p["sport"] + p["cit"]}
tents = entities(list(team_q))
cents = entities(list(country_q))

SPECIAL = {"Q21": "ENG", "Q22": "SCO", "Q25": "WAL", "Q26": "NIR"}
def ccode(q):
    if q in SPECIAL: return SPECIAL[q]
    e = cents.get(q)
    v = _vals(e, "P298") if e else []
    return v[0][0] if v else None

NAT_TYPES = {"Q6979593", "Q1194951", "Q23905105", "Q23847779", "Q23759293", "Q26887310", "Q23901137"}
def is_nat(tq):
    e = tents.get(tq)
    return bool(e) and bool({v for v, _ in _vals(e, "P31")} & NAT_TYPES)

norm = lambda s: re.sub(r"[^a-z0-9 ]", " ", "".join(ch for ch in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(ch) != "Mn"))
STOP = {"club", "fc", "cf", "ca", "cd", "sc", "ac", "afc", "de", "del", "la", "el", "futbol", "football", "atletico", "sociedad", "deportivo", "sport", "ss", "us", "as", "1", "s", "a", "c", "sad"}
def toks(s): return {t for t in norm(s).split() if t not in STOP and len(t) > 1}
ALIAS = {"Bayern Múnich": "bayern munich", "Olympique de Marsella": "marseille", "Inter": "internazionale", "Milan": "milan", "Spartak Moscú": "spartak moscow",
         "Hamburgo": "hamburger", "Colonia": "koln", "Copenhague": "copenhagen", "Slavia Praga": "slavia prague", "Sparta Praga": "sparta prague",
         "Crvena Zvezda": "red star belgrade", "Gimnasia y Esgrima LP": "gimnasia esgrima plata", "Estudiantes": "estudiantes plata", "Club América": "america",
         "Chivas": "guadalajara", "Pumas": "unam", "Tigres": "tigres uanl", "PSV": "psv eindhoven", "Paris Saint-Germain": "paris saint germain",
         "Newell's Old Boys": "newell", "Unión": "union santa fe", "Colón": "colon santa fe", "Vélez Sarsfield": "velez sarsfield", "Sporting CP": "sporting cp"}
def same_club(ours, tq):
    e = tents.get(tq)
    if not e: return False
    labs = [label(e, "es"), label(e, "en")]
    want = toks(ALIAS.get(ours, ours))
    for l in labs:
        have = toks(l)
        if want and (want <= have or (have and have <= want and len(have) >= 1 and len(want) <= 3)): return True
    return False
def tname(tq):
    e = tents.get(tq); return (label(e, "es") or tq) if e else tq

def club_stints(p):
    return [t for t in p["teams"] if not is_nat(t["qid"])]

report = {"players": [], "coaches": [], "careers": [], "missing": [v["name"] for v in ids.values() if not v["qid"]]}

for x in players:
    q = ids.get(x["id"], {}).get("qid"); p = prof.get(q)
    if not p: continue
    issues = []
    if p["birth"] and x.get("birthDate") != p["birth"]: issues.append(f"nacimiento {x.get('birthDate')} → {p['birth']}")
    codes = [c for c in (ccode(c) for c in p["sport"] or p["cit"]) if c]
    if codes and x["nationality"] not in codes: issues.append(f"nacionalidad {x['nationality']} → {'/'.join(codes)}")
    stints = club_stints(p)
    current = [t for t in stints if t["start"] and not t["end"]]
    cur = current[-1] if current else None
    if cur and not same_club(x["club"], cur["qid"]): issues.append(f"club {x['club']} → {tname(cur['qid'])} (desde {cur['start']}{', préstamo' if cur['loan'] else ''})")
    mine = [t for t in stints if same_club(x["club"], t["qid"])]
    nums = [t["num"] for t in mine if t["num"]]
    if nums and str(x.get("number")) not in nums: issues.append(f"dorsal {x.get('number')} → {nums[-1]}")
    report["players"].append({"id": x["id"], "name": x["name"], "qid": q, "check": bool(x.get("check")), "issues": issues})

for x in coaches:
    q = ids.get(x["id"], {}).get("qid"); p = prof.get(q)
    if not p: continue
    issues = []
    if p["birth"] and x.get("birthDate") != p["birth"]: issues.append(f"nacimiento {x.get('birthDate')} → {p['birth']}")
    codes = [c for c in (ccode(c) for c in p["sport"] or p["cit"]) if c]
    if codes and x["nationality"] not in codes: issues.append(f"nacionalidad {x['nationality']} → {'/'.join(codes)}")
    report["coaches"].append({"id": x["id"], "name": x["name"], "qid": q, "check": bool(x.get("check")), "issues": issues})

for x in careers:
    q = ids.get(x["id"], {}).get("qid"); p = prof.get(q)
    if not p: continue
    if x.get("kind") == "dt": continue  # Wikidata casi no tiene etapas de DT con fechas: se revisan a mano
    wd = [t for t in club_stints(p) if t["start"]]
    issues = []
    for st in x["career"]:
        m = [t for t in wd if same_club(st["club"], t["qid"])]
        if not m: issues.append(f"{st['club']} {st['from']}-{st['to']}: no figura en Wikidata"); continue
        if not any(abs(int(t["start"]) - st["from"]) <= 1 for t in m): issues.append(f"{st['club']}: desde {st['from']} → Wikidata {', '.join(t['start'] for t in m)}")
    report["careers"].append({"id": x["id"], "name": x["name"], "qid": q, "issues": issues,
                              "wikidata": [f"{tname(t['qid'])} {t['start']}-{t['end'] or ''}{' (p)' if t['loan'] else ''}" for t in wd]})

json.dump(report, open(os.path.join(os.path.dirname(__file__), "verify_report.json"), "w"), ensure_ascii=False, indent=1)
for k in ("players", "coaches", "careers"):
    bad = [r for r in report[k] if r["issues"]]
    print(f"{k}: {len(report[k])} verificados, {len(bad)} con diferencias")
print("no encontrados:", len(report["missing"]))
