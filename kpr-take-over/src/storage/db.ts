import type { SavedSim, SavedSimBerjenjang, SavedSimTakeOver } from '../lib/types';

export function simBerjenjang(s: SavedSim): s is SavedSimBerjenjang {
  return s.jenis === 'berjenjang';
}

export function simTakeOver(s: SavedSim): s is SavedSimTakeOver {
  return s.jenis !== 'berjenjang';
}

const KEY_SIM = 'kpr.sims.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / tidak tersedia — abaikan */
  }
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------------------------- Riwayat simulasi ---------------------------- */

export function loadSims(): SavedSim[] {
  return read<SavedSim[]>(KEY_SIM, []).sort((a, b) => b.dibuat - a.dibuat);
}

export function saveSim(sim: SavedSim): void {
  const sims = read<SavedSim[]>(KEY_SIM, []);
  const idx = sims.findIndex((s) => s.id === sim.id);
  if (idx >= 0) sims[idx] = sim;
  else sims.push(sim);
  write(KEY_SIM, sims);
}

export function deleteSim(id: string): void {
  write(KEY_SIM, read<SavedSim[]>(KEY_SIM, []).filter((s) => s.id !== id));
}
