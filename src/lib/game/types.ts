export type Status = "hit" | "near" | "miss";
export type Arrow = "up" | "down";

/** Resultado de comparar un atributo del intento contra el objetivo. */
export interface Cell {
  status: Status;
  display: string;
  /** Si el objetivo es mayor ("up") o menor ("down") que el intento. */
  arrow?: Arrow;
}

export interface Attribute<T> {
  key: string;
  label: string;
  compare: (guess: T, target: T, today: Date) => Cell;
  /** Qué significa el amarillo en este atributo (para las instrucciones). */
  nearHint: string;
  /** Versión de 1-2 palabras para el ejemplo visual. */
  nearShort: string;
  /** Si el valor es numérico, con flechas ▲▼. */
  numeric?: boolean;
}

export interface Entity {
  id: string;
  name: string;
}

export interface Player extends Entity {
  club: string;
  league: string;
  nationality: string;
  position: string;
  number: number;
  birthDate: string;
}

export interface Coach extends Entity {
  team: string;
  league: string;
  nationality: string;
  birthDate: string;
  formation: string;
  debutYear: number;
}

export type GameId = "jugador" | "dt";

export interface GameDefinition<T extends Entity> {
  id: GameId;
  title: string;
  noun: string;
  maxGuesses: number;
  /** Semilla para el orden diario; cambiarla reordena todo el calendario. */
  seed: number;
  items: T[];
  attributes: Attribute<T>[];
  subtitle: (item: T) => string;
}
