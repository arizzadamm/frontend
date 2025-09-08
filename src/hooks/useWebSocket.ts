import { useEffect, useRef, useState } from 'react';
import { Attack } from '../types/Attack';

interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  attacks: Attack[];
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
  stats: {
    totalAttacks: number;
    attacksPerMinute: number;
    topSourceCountries: Array<{ country: string; count: number }>;
    topTargetCountries: Array<{ country: string; count: number }>;
    attackTypes: Array<{ type: string; count: number }>;
  };
}

export const useWebSocket = ({
  url,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todayTotal, setTodayTotal] = useState<number | undefined>(undefined);
  const [todayByCountry, setTodayByCountry] = useState<Array<{ country: string; count: number }> | undefined>(undefined);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const allAttacksRef = useRef<Attack[]>([]);
  const startTimeRef = useRef<Date>(new Date());

  // Calculate statistics
  const calculateStats = (allAttacks: Attack[]) => {
    const now = new Date();
    const timeDiff = (now.getTime() - startTimeRef.current.getTime()) / (1000 * 60); // minutes
    
    // Count attacks by source country
    const sourceCountryCount: { [key: string]: number } = {};
    const targetCountryCount: { [key: string]: number } = {};
    const attackTypeCount: { [key: string]: number } = {};

    allAttacks.forEach(attack => {
      // Source country
      const srcCountry = attack.src_geo?.country || 'Unknown';
      sourceCountryCount[srcCountry] = (sourceCountryCount[srcCountry] || 0) + 1;
      
      // Target country
      const dstCountry = attack.dst_geo?.country || 'Unknown';
      targetCountryCount[dstCountry] = (targetCountryCount[dstCountry] || 0) + 1;
      
      // Attack type
      attackTypeCount[attack.type] = (attackTypeCount[attack.type] || 0) + 1;
    });

    const topSourceCountries = Object.entries(sourceCountryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const topTargetCountries = Object.entries(targetCountryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const attackTypes = Object.entries(attackTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAttacks: allAttacks.length,
      attacksPerMinute: timeDiff > 0 ? allAttacks.length / timeDiff : 0,
      topSourceCountries,
      topTargetCountries,
      attackTypes
    };
  };

  const connect = () => {
    try {
      setError(null);
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          if (!event?.data) return;
          
          const parsed = JSON.parse(event.data);
          
          // Backward compatible: array = attacks batch
          if (Array.isArray(parsed)) {
            // Validate attack data structure
            const validAttacks = parsed.filter(attack => 
              attack && 
              typeof attack === 'object' && 
              attack.src_geo && 
              attack.dst_geo &&
              typeof attack.src_geo.lon === 'number' &&
              typeof attack.src_geo.lat === 'number' &&
              typeof attack.dst_geo.lon === 'number' &&
              typeof attack.dst_geo.lat === 'number'
            );
            
            if (validAttacks.length > 0) {
              // Add new attacks to the list
              allAttacksRef.current = [...allAttacksRef.current, ...validAttacks];
              
              // Keep only recent attacks (last 1000)
              if (allAttacksRef.current.length > 1000) {
                allAttacksRef.current = allAttacksRef.current.slice(-1000);
              }
              
              // Update state with recent attacks for visualization
              setAttacks(validAttacks);
              setLastUpdate(new Date());
            }
          } else if (parsed && typeof parsed === 'object' && parsed.type === 'statsToday') {
            // Update derived stats from backend today aggregation
            const payload = parsed.payload || {};
            setTodayTotal(typeof payload.total === 'number' ? payload.total : 0);
            setTodayByCountry(Array.isArray(payload.countries) ? payload.countries : []);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Error parsing attack data');
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const stats = {
    ...calculateStats(allAttacksRef.current),
    todayTotal,
    todayByCountry
  };

  return {
    attacks,
    isConnected,
    lastUpdate,
    error,
    stats
  };
};
