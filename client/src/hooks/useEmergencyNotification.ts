import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

interface EmergencyAlert {
  id: string;
  type: 'earthquake' | 'flood' | 'fire';
  magnitude?: number;
  location: string;
  timestamp: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // km
}

interface EmergencyNotificationState {
  isEmergencyActive: boolean;
  currentAlert?: EmergencyAlert;
  hasUnreadAlert: boolean;
}

// Mock emergency alert data - in production this would come from government APIs
const mockEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'eq-seoul-001',
    type: 'earthquake',
    magnitude: 6.2,
    location: '서울 인근',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    coordinates: { lat: 37.5665, lng: 126.9780 }, // Seoul
    radius: 50
  }
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useEmergencyNotification(): EmergencyNotificationState & {
  checkForEmergencies: () => void;
  markAlertAsRead: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  sendPushNotification: (alert: EmergencyAlert) => void;
} {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert>();
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);
  const { location } = useGeolocation();

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const sendPushNotification = (alert: EmergencyAlert) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('🚨 긴급재난문자', {
        body: `${alert.type === 'earthquake' ? '지진' : '재난'} 발생: ${alert.location}${alert.magnitude ? ` (규모 ${alert.magnitude})` : ''}`,
        icon: '/emergency-icon.png',
        badge: '/badge-icon.png',
        tag: alert.id,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/emergency';
        notification.close();
      };

      // Auto close after 30 seconds
      setTimeout(() => notification.close(), 30000);
    }
  };

  const checkForEmergencies = () => {
    if (!location) return;

    // Check if user is in range of any emergency alerts
    for (const alert of mockEmergencyAlerts) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        alert.coordinates.lat,
        alert.coordinates.lng
      );

      if (distance <= alert.radius) {
        setIsEmergencyActive(true);
        setCurrentAlert(alert);
        setHasUnreadAlert(true);
        sendPushNotification(alert);
        
        // Store emergency state
        localStorage.setItem('emergency-active', 'true');
        localStorage.setItem('current-alert', JSON.stringify(alert));
        break;
      }
    }
  };

  const markAlertAsRead = () => {
    setHasUnreadAlert(false);
    localStorage.removeItem('emergency-active');
    localStorage.removeItem('current-alert');
  };

  useEffect(() => {
    // Check for saved emergency state
    const savedEmergency = localStorage.getItem('emergency-active');
    const savedAlert = localStorage.getItem('current-alert');
    
    if (savedEmergency && savedAlert) {
      setIsEmergencyActive(true);
      setCurrentAlert(JSON.parse(savedAlert));
      setHasUnreadAlert(true);
    }
  }, []);

  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission();

    // Check for emergencies every 30 seconds
    const interval = setInterval(checkForEmergencies, 30000);
    
    // Initial check
    checkForEmergencies();

    return () => clearInterval(interval);
  }, [location]);

  return {
    isEmergencyActive,
    currentAlert,
    hasUnreadAlert,
    checkForEmergencies,
    markAlertAsRead,
    requestNotificationPermission,
    sendPushNotification
  };
}