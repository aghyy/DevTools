import api from '@/utils/axios';
import { toast } from 'sonner';

// Get optimized response time chart data
export const getResponseTimeChartData = async () => {
  try {
    const response = await api.get('/api/performance/chart-data');
    return response.data;
  } catch {
    toast.error('Error fetching response time data');
    return { current: 0, change: 0, data: [], tools: [], topTools: [], weeklyAvg: 0 };
  }
}; 