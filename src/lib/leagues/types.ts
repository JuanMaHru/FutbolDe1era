import type { GameId } from "../game/types";

export interface Member {
  id: string;
  name: string;
  /** Rival simulado (solo en modo local, para que la tabla tenga vida). */
  demo?: boolean;
}

export interface League {
  code: string;
  name: string;
  createdAt: string;
  members: Member[];
}

export interface Standing {
  member: Member;
  total: number;
  /** Puntos por día de la semana (lun..dom); null = no jugó / día futuro. */
  days: (number | null)[];
  played: number;
}

/**
 * Contrato del backend de ligas. La UI solo habla con esto.
 * Fase 1: LocalLeagueService (localStorage). Después: SupabaseLeagueService.
 */
export interface LeagueService {
  readonly mode: "local" | "remote";
  myLeagues(): Promise<League[]>;
  create(name: string): Promise<League>;
  join(code: string): Promise<League>;
  leave(code: string): Promise<void>;
  get(code: string): Promise<League | null>;
  standings(code: string, weekOf: string, games: GameId[]): Promise<Standing[]>;
}
