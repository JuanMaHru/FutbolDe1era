import playersData from "@/data/players.json";
import coachesData from "@/data/coaches.json";
import type { Coach, GameDefinition, GameId, Player } from "./types";
import { coachAttributes, playerAttributes } from "./compare";
import { COUNTRIES, POSITIONS } from "./meta";

export const BRAND = "Fútbol de Primera";

export const playerGame: GameDefinition<Player> = {
  id: "jugador",
  title: "Jugador",
  noun: "jugador",
  maxGuesses: 8,
  seed: 20261101,
  items: playersData as Player[],
  targets: (playersData as Player[]).filter((p) => !p.check),
  attributes: playerAttributes,
  subtitle: (p) => `${POSITIONS[p.position]?.label ?? p.position} · ${p.club} · ${COUNTRIES[p.nationality]?.flag ?? ""}`,
};

export const coachGame: GameDefinition<Coach> = {
  id: "dt",
  title: "DT",
  noun: "entrenador",
  maxGuesses: 8,
  seed: 19781986,
  items: coachesData as Coach[],
  targets: (coachesData as Coach[]).filter((c) => !c.check),
  attributes: coachAttributes,
  subtitle: (c) => `${c.team} · ${c.playedAs === "NJ" ? "No jugó profesionalmente" : `Jugó de ${POSITIONS[c.playedAs]?.label.toLowerCase()}`} · ${COUNTRIES[c.nationality]?.flag ?? ""}`,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GuessGameId = "jugador" | "dt";
export const GAMES: Record<GuessGameId, GameDefinition<any>> = { jugador: playerGame, dt: coachGame };
export const GAME_IDS: GuessGameId[] = ["jugador", "dt"];
