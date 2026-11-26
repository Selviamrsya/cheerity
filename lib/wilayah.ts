/**
 * Wilayah Indonesia helpers — fetches province & regency (kota/kabupaten)
 * data from the emsifa static API.
 * Docs: https://github.com/emsifa/api-wilayah-indonesia
 */

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/v2";

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  name: string;
  type: string;
}

interface ApiResponse<T> {
  data: T[];
  meta?: { updated_at?: string; level?: number };
}

let provincesCache: Province[] | null = null;
let provincesPromise: Promise<Province[]> | null = null;
const regenciesCache = new Map<string, Regency[]>();
const regenciesPromises = new Map<string, Promise<Regency[]>>();

export async function fetchProvinces(): Promise<Province[]> {
  if (provincesCache) return provincesCache;
  if (!provincesPromise) {
    provincesPromise = fetch(`${BASE_URL}/provinces.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch provinces: ${res.status}`);
        return res.json() as Promise<ApiResponse<Province>>;
      })
      .then((json) => {
        provincesCache = json.data.map((p) => ({ id: p.id, name: p.name }));
        return provincesCache;
      })
      .catch((err) => {
        provincesPromise = null;
        throw err;
      });
  }
  return provincesPromise;
}

export async function fetchRegencies(provinceId: string): Promise<Regency[]> {
  const cached = regenciesCache.get(provinceId);
  if (cached) return cached;

  let pending = regenciesPromises.get(provinceId);
  if (!pending) {
    pending = fetch(`${BASE_URL}/regencies/${provinceId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch regencies: ${res.status}`);
        return res.json() as Promise<ApiResponse<Regency>>;
      })
      .then((json) => {
        const regencies = json.data.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type ?? "",
        }));
        regenciesCache.set(provinceId, regencies);
        return regencies;
      })
      .catch((err) => {
        regenciesPromises.delete(provinceId);
        throw err;
      });
    regenciesPromises.set(provinceId, pending);
  }
  return pending;
}
