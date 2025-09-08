export interface Attack {
  id: string;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  src_geo: {
    lat: number;
    lon: number;
    country?: string;
    city?: string;
  };
  dst_geo: {
    lat: number;
    lon: number;
    country?: string;
    city?: string;
  };
  type: string;
}

export interface AttackStats {
  totalAttacks: number;
  attacksPerMinute: number;
  topSourceCountries: Array<{ country: string; count: number }>;
  topTargetCountries: Array<{ country: string; count: number }>;
  attackTypes: Array<{ type: string; count: number }>;
  todayTotal?: number;
  todayByCountry?: Array<{ country: string; count: number }>;
}
