"""Aplica correcciones de Wikidata (tools/verify_report.json) a players.json y coaches.json.
- Pases de 2026 en adelante → club y liga nuevos.
- Nacimiento: si el dato estaba marcado para revisar o difiere más de 40 días.
- Saca la marca "check" a quien quedó verificado (ID confiable y sin diferencias)."""
import json, os, re, sys, unicodedata, datetime
sys.path.insert(0, os.path.dirname(__file__))
import wikidata as wd

ROOT = os.path.join(os.path.dirname(__file__), "..")
P = f"{ROOT}/src/data/players.json"; C = f"{ROOT}/src/data/coaches.json"
players = json.load(open(P)); coaches = json.load(open(C))
rep = json.load(open(os.path.join(os.path.dirname(__file__), "verify_report.json")))
ids = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_ids.json")))

LEAGUE_BY_COUNTRY = {"Q145": "Premier League", "Q21": "Premier League", "Q29": "LaLiga", "Q38": "Serie A", "Q183": "Bundesliga", "Q142": "Ligue 1",
    "Q45": "Primeira Liga", "Q55": "Eredivisie", "Q43": "Süper Lig", "Q414": "Liga Profesional", "Q155": "Brasileirão", "Q77": "Liga Uruguaya",
    "Q96": "Liga MX", "Q30": "MLS", "Q16": "MLS", "Q851": "Saudi Pro League", "Q739": "Liga Colombiana", "Q298": "Primera Chile",
    "Q159": "Liga Rusa", "Q846": "Liga de Catar", "Q31": "Liga Belga"}
from clubnames import our_name

def days(a, b):
    return abs((datetime.date.fromisoformat(a) - datetime.date.fromisoformat(b)).days)

by_id = {p["id"]: p for p in players}; changes = []
for r in rep["players"]:
    p = by_id[r["id"]]; fix = r.get("fix", {}); score = ids.get(r["id"], {}).get("score", 0)
    if score < 6: continue  # identificación dudosa: no tocamos nada
    remaining = []
    c = fix.get("club")
    if c and int(c["start"]) >= 2026:
        e = wd.entities([c["qid"]]).get(c["qid"])
        lgq = [v for v, _ in wd._vals(e, "P17")] if e else []
        league = next((LEAGUE_BY_COUNTRY[q] for q in lgq if q in LEAGUE_BY_COUNTRY), None)
        name = our_name(c["es"], c.get("en"))
        if league:
            changes.append(f"{p['name']}: {p['club']} → {name}{' (préstamo)' if c['loan'] else ''} [{league}]")
            p["club"], p["league"] = name, league
        else: remaining.append("club")
    elif c: remaining.append("club-viejo")
    b = fix.get("birthDate")
    if b and (p.get("check") or days(b, p["birthDate"]) > 40):
        changes.append(f"{p['name']}: nació {p['birthDate']} → {b}"); p["birthDate"] = b
    elif b: remaining.append("nac")
    if any(i.startswith("nacionalidad") for i in r["issues"]): remaining.append("pais")
    if p.get("check") and not [x for x in remaining if x != "club-viejo"]:
        del p["check"]; changes.append(f"{p['name']}: verificado ✓")
byc = {c["id"]: c for c in coaches}
for r in rep["coaches"]:
    c = byc[r["id"]]; score = ids.get(r["id"], {}).get("score", 0)
    if score < 6: continue
    if r.get("birth_wd") and c["birthDate"] != r["birth_wd"] and (c.get("check") or days(r["birth_wd"], c["birthDate"]) > 40):
        changes.append(f"DT {c['name']}: nació {c['birthDate']} → {r['birth_wd']}"); c["birthDate"] = r["birth_wd"]
    if c.get("check") and not any(i.startswith("nacionalidad") for i in r["issues"]):
        del c["check"]; changes.append(f"DT {c['name']}: verificado ✓")
json.dump(players, open(P, "w"), ensure_ascii=False, indent=1); json.dump(coaches, open(C, "w"), ensure_ascii=False, indent=1)
open(os.path.join(os.path.dirname(__file__), "fixes_log.txt"), "w").write("\n".join(changes) + "\n")
print(len(changes), "cambios"); print("\n".join(changes))
