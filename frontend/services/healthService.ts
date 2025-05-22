import { toast } from 'sonner';
import api from '../utils/axios';

export interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      uptime: string | null;
    };
    system: {
      status: 'healthy' | 'unhealthy';
      uptime: string;
      memory: {
        total: number;
        free: number;
        used: number;
        percentage: string;
      };
      cpu: {
        cores: number;
        loadAverage: string[];
      };
    };
  };
}

export const getSystemHealth = async (): Promise<SystemHealth> => {
  try {
    const response = await api.get('/api/health/system');
    return response.data;
  } catch {
    toast.error("Failed to fetch system health.");
    return {} as SystemHealth;
  }
}; 