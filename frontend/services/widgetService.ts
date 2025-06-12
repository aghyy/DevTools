import api from '../utils/axios';
import { toast } from 'sonner';

export interface Widget {
  id?: number;
  widgetType: string;
  position: number;
  isActive: boolean;
  settings: Record<string, unknown>;
}

export interface AvailableWidget {
  type: string;
  name: string;
  description: string;
  icon: string;
}

// Get user widgets
export const getUserWidgets = async (): Promise<Widget[]> => {
  try {
    const response = await api.get('/api/widgets');
    return response.data;
  } catch {
    toast.error('Failed to load widgets');
    return [];
  }
};

// Update user widgets (bulk update for drag and drop)
export const updateUserWidgets = async (widgets: Widget[]): Promise<boolean> => {
  try {
    await api.put('/api/widgets', { widgets });
    return true;
  } catch {
    toast.error('Failed to update widgets');
    return false;
  }
};

// Add a single widget
export const addWidget = async (widgetType: string, settings?: Record<string, unknown>): Promise<Widget | null> => {
  try {
    const response = await api.post('/api/widgets', { widgetType, settings });
    toast.success('Widget added successfully');
    return response.data.widget;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to add widget';
    toast.error(message);
    return null;
  }
};

// Remove a widget
export const removeWidget = async (widgetId: number): Promise<boolean> => {
  try {
    await api.delete(`/api/widgets/${widgetId}`);
    toast.success('Widget removed successfully');
    return true;
  } catch {
    toast.error('Failed to remove widget');
    return false;
  }
};

// Get available widget types
export const getAvailableWidgets = async (): Promise<AvailableWidget[]> => {
  try {
    const response = await api.get('/api/widgets/available');
    return response.data;
  } catch {
    toast.error('Failed to load available widgets');
    return [];
  }
}; 