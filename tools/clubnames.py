"""Nombres de club: de la etiqueta de Wikidata al nombre que usa el sitio (para escudos y consignas)."""
import json, os, re, unicodedata
ROOT = os.path.join(os.path.dirname(__file__), "..")
players = json.load(open(f"{ROOT}/src/data/players.json"))
norm = lambda s: re.sub(r"[^a-z0-9 ]", " ", "".join(ch for ch in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(ch) != "Mn"))
STOP = {"club", "fc", "cf", "ca", "cd", "sc", "ac", "afc", "de", "del", "la", "el", "futbol", "football", "futebol", "sociedad", "deportivo", "sport", "ss", "us", "as", "1", "s", "a", "c", "sad", "spor", "kulubu", "calcio", "regatas", "e", "do", "da"}
toks = lambda s: {t for t in norm(s).split() if t not in STOP and len(t) > 1}

# Nombres de club que ya usa el sitio (para escudos y consignas).
known = {p["club"] for p in players}
ts = open(f"{ROOT}/src/lib/career/world.ts").read() + open(f"{ROOT}/src/lib/clubs.ts").read()
known |= set(re.findall(r'\["([^"]+)", "[A-Z0-9-]+", \d+\]', ts)) | set(re.findall(r'^\s*"([^"]+)": \{ short', ts, re.M))
ALIAS = {"Real Espanyol de Barcelona": "Espanyol", "Stade Rennais": "Rennes", "Stade Rennais Football Club": "Rennes", "Olympique Lyonnais": "Lyon", "Inter de Milán": "Inter", "Inter de Miami": "Inter Miami", "Fútbol Club Barcelona": "Barcelona", "Real Madrid Club de Fútbol": "Real Madrid",
         "Fútbol Club Oporto": "Porto", "Club Brujas": "Club Brugge", "A.S. Roma": "Roma", "Paris Saint-Germain FC": "Paris Saint-Germain",
         "Arsenal Fútbol Club": "Arsenal", "Liverpool Fútbol Club": "Liverpool", "Club Atlético River Plate": "River Plate", "Club de Fútbol América": "Club América",
         "Real Club Deportivo de A Coruña": "Deportivo La Coruña", "Calcio Como 1907": "Como", "Ajax de Ámsterdam": "Ajax", "Clube de Regatas do Flamengo": "Flamengo",
         "Santos Futebol Clube": "Santos", "Grêmio Foot-Ball Porto Alegrense": "Grêmio", "Fluminense Football Club": "Fluminense", "Botafogo de Futebol e Regatas": "Botafogo",
         "Club Atlas de Guadalajara": "Atlas", "Club Nacional de Football": "Nacional", "Club Atlético Peñarol": "Peñarol", "Deportivo Independiente Medellín": "Independiente Medellín",
         "Fenerbahçe Spor Kulübü": "Fenerbahçe", "Galatasaray Spor Kulübü": "Galatasaray", "Beşiktaş Jimnastik Kulübü": "Beşiktaş", "Al-Hilal": "Al Hilal",
         "Bologna Football Club 1909": "Bologna", "AFC Bournemouth": "Bournemouth", "FC Schalke 04": "Schalke 04", "Chicago Fire": "Chicago Fire", "Orlando City Soccer Club": "Orlando City"}
def our_name(es, en):
    if es in ALIAS: return ALIAS[es]
    labs = [es, en or ""]
    nl = [norm(x).strip() for x in labs]
    # 1) Igual (sin tildes) a un nombre conocido.
    for k in known:
        if norm(k).strip() in nl: return k
    # 2) Mismas palabras significativas.
    tl = [toks(x) for x in labs]
    for k in known:
        if toks(k) and any(toks(k) == x for x in tl): return k
    # 3) Contenido, con al menos 2 palabras en común (evita "Real" → cualquier Real).
    best = None
    for k in known:
        a = toks(k)
        if len(a) >= 2 and any(a <= x and len(x - a) <= 2 for x in tl) and not re.search(r"\b(B|II)$", k):
            if not best or len(a) > len(toks(best)): best = k
    if best: return best
    # 4) Nombre de una sola palabra distintiva (Napoli, Tottenham, Estudiantes…), dentro de la etiqueta.
    GENERIC = {"real", "racing", "sporting", "nacional", "independiente", "union", "atletico", "united", "city", "inter", "america", "olimpia",
               "libertad", "junior", "santos", "internacional", "atlas", "leon", "tigre", "tigres", "cerro", "progreso", "atlanta", "mitre", "nacional"}
    cands = [k for k in known if len(toks(k)) == 1 and not (toks(k) & GENERIC) and any(toks(k) <= x for x in tl) and not re.search(r"\b(B|II)$", k)]
    if len(cands) == 1: return cands[0]
    s = re.sub(r"\b(Football Club|Fútbol Club|Futebol Clube|Club de Fútbol|Club Atlético|Club Deportivo|Spor Kulübü|Sports Club|Association Football Club|Soccer Club|F\.?C\.?|S\.?C\.?)\b", "", es).strip(" .")
    return re.sub(r"\s+", " ", s) or es

