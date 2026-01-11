/**
 * WebSocket Service for Real-time Notifications
 * Handles WebSocket connection using STOMP over SockJS
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENV } from '../../../config/env';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
  }

  /**
   * Connect to WebSocket server
   * @param {string} companyId - Company ID to subscribe to notifications
   * @param {Function} onNotification - Callback when new notification arrives
   */
  connect(companyId, onNotification) {
    if (this.connected && this.client) {
      console.log('WebSocket already connected');
      this.subscribeToCompanyNotifications(companyId, onNotification);
      return;
    }

    console.log('Connecting to WebSocket...', ENV.NOTIFICATION_WS_URL);

    this.client = new Client({
      webSocketFactory: () => new SockJS(ENV.NOTIFICATION_WS_URL),
      
      connectHeaders: {},
      
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket connected successfully');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to company-specific notifications
        this.subscribeToCompanyNotifications(companyId, onNotification);
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connected = false;
      },

      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        this.connected = false;
        this.handleReconnect(companyId, onNotification);
      },

      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        this.connected = false;
      },
    });

    this.client.activate();
  }

  /**
   * Subscribe to company-specific notification topic
   */
  subscribeToCompanyNotifications(companyId, onNotification) {
    if (!this.client || !this.connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    const topic = `/topic/notifications/${companyId}`;
    
    // Unsubscribe if already subscribed
    if (this.subscriptions.has(companyId)) {
      this.subscriptions.get(companyId).unsubscribe();
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('Received notification:', notification);
        
        if (onNotification && typeof onNotification === 'function') {
          onNotification(notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set(companyId, subscription);
    console.log(`Subscribed to notifications for company: ${companyId}`);
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect(companyId, onNotification) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(companyId, onNotification);
    }, this.reconnectDelay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
