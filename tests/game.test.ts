import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ageOn, coachAttributes, numeric, playerAttributes } from "../src/lib/game/compare.ts";
import { dateKey, dayNumber, pickDaily } from "../src/lib/game/daily.ts";
import { points, shareText } from "../src/lib/game/scoring.ts";
import { search } from "../src/lib/game/text.ts";
import { COUNTRIES, LEAGUES, POSITIONS } from "../src/lib/game/meta.ts";
import { weekKeys } from "../src/lib/leagues/week.ts";

const players = JSON.parse(readFileSync("src/data/players.json", "utf8"));
const coaches = JSON.parse(readFileSync("src/data/coaches.json", "utf8"));
const today = new Date("2026-11-25T00:00:00Z");
const byName = (n: string) => players.find((p: { name: string }) => p.name === n);

test("los datos referencian países, ligas y posiciones conocidas", () => {
  for (const p of players) {
    assert.ok(COUNTRIES[p.nationality], `país ${p.nationality} (${p.name})`);
    assert.ok(LEAGUES[p.league], `liga ${p.league} (${p.name})`);
    assert.ok(POSITIONS[p.position], `posición ${p.position} (${p.name})`);
  }
  for (const c of coaches) {
    assert.ok(COUNTRIES[c.nationality], `país ${c.nationality} (${c.name})`);
    assert.ok(LEAGUES[c.league], `liga ${c.league} (${c.name})`);
  }
  const ids = [...players, ...coaches].map((x: { id: string }) => x.id);
  assert.equal(new Set(ids).size, ids.length, "ids únicos");
});

test("edad considera si ya cumplió años", () => {
  assert.equal(ageOn("1987-06-24", today), 39);
  assert.equal(ageOn("2000-11-26", today), 25);
  assert.equal(ageOn("2000-11-25", today), 26);
});

test("numérico: verde, amarillo con flecha, gris", () => {
  assert.deepEqual(numeric(10, 10, 3), { status: "hit", display: "10" });
  assert.deepEqual(numeric(7, 10, 3), { status: "near", display: "7", arrow: "up" });
  assert.deepEqual(numeric(30, 10, 3), { status: "miss", display: "30", arrow: "down" });
});

test("jugador: Messi vs Suárez (mismo club)", () => {
  const cells = playerAttributes.map((a) => a.compare(byName("Luis Suárez"), byName("Lionel Messi"), today).status);
  // club, liga, país (URU vs ARG = CONMEBOL), posición (DC vs EXT = ataque), edad 39 vs 39, dorsal 9 vs 10
  assert.deepEqual(cells, ["hit", "hit", "near", "near", "hit", "near"]);
});

test("jugador: club amarillo si es misma liga", () => {
  const c = playerAttributes[0].compare(byName("Franco Armani"), byName("Edinson Cavani"), today);
  assert.equal(c.status, "near");
});

test("DT: esquema amarillo por misma línea de fondo", () => {
  const scaloni = coaches.find((c: { name: string }) => c.name === "Lionel Scaloni");
  const pep = coaches.find((c: { name: string }) => c.name === "Pep Guardiola");
  const f = coachAttributes.find((a) => a.key === "formation")!;
  assert.equal(f.compare(pep, scaloni, today).status, "near"); // 4-3-3 vs 4-4-2
});

test("reto diario: determinístico y sin repetir dentro de un ciclo", () => {
  assert.equal(pickDaily(players, 1, "2026-11-25").id, pickDaily(players, 1, "2026-11-25").id);
  const seen = new Set<string>();
  for (let i = 0; i < players.length; i++) {
    const d = new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10);
    seen.add(pickDaily(players, 1, d).id);
  }
  assert.equal(seen.size, players.length);
});

test("número de reto y clave de fecha en hora argentina", () => {
  assert.equal(dayNumber("2026-11-01"), 1);
  assert.equal(dayNumber("2026-11-25"), 25);
  // 02:00 UTC del 26 = 23:00 del 25 en Buenos Aires
  assert.equal(dateKey(new Date("2026-11-26T02:00:00Z")), "2026-11-25");
});

test("puntos y texto para compartir", () => {
  assert.equal(points(true, 1), 10);
  assert.equal(points(true, 4), 7);
  assert.equal(points(true, 8), 3);
  assert.equal(points(false, 8), 0);
  const t = shareText({ brand: "FP", title: "Jugador", day: 3, won: true, maxGuesses: 8, rows: [[{ status: "near", display: "" }, { status: "hit", display: "" }]] });
  assert.equal(t, "⚽ FP #3 · Jugador 1/8\n🟨🟩");
});

test("búsqueda ignora tildes y prioriza inicio de palabra", () => {
  const r = search(players, "alvarez", new Set());
  assert.equal(r[0].name, "Julián Álvarez");
  assert.equal(search(players, "mart", new Set())[0].name.split(" ").some((w: string) => w.startsWith("Mart")), true);
});

test("semana arranca el lunes", () => {
  const w = weekKeys("2026-11-25"); // miércoles
  assert.equal(w[0], "2026-11-23");
  assert.equal(w[6], "2026-11-29");
});
