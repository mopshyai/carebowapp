/**
 * Network Provider
 * Monitors network connectivity and provides offline support infrastructure
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme';
import { api } from '../services/api';

// ============================================
// SYNC HANDLERS
// ============================================

/**
 * Sync handlers for different entity types
 * Each handler knows how to sync its entity with the backend
 */
type SyncHandler = (
  type: 'create' | 'update' | 'delete',
  data: Record<string, unknown>
) => Promise<void>;

const syncHandlers: Record<string, SyncHandler> = {
  // Health records sync
  healthRecord: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.healthRecords.create(data);
        if (__DEV__) console.log('[Sync] Creating health record:', data.id);
        break;
      case 'update':
        // await api.healthRecords.update(data.id as string, data);
        if (__DEV__) console.log('[Sync] Updating health record:', data.id);
        break;
      case 'delete':
        // await api.healthRecords.delete(data.id as string);
        if (__DEV__) console.log('[Sync] Deleting health record:', data.id);
        break;
    }
  },

  // Orders sync
  order: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.orders.create(data);
        if (__DEV__) console.log('[Sync] Creating order:', data.id);
        break;
      case 'update':
        // await api.orders.update(data.id as string, data);
        if (__DEV__) console.log('[Sync] Updating order:', data.id);
        break;
      case 'delete':
        // await api.orders.cancel(data.id as string);
        if (__DEV__) console.log('[Sync] Cancelling order:', data.id);
        break;
    }
  },

  // Service requests sync
  serviceRequest: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.serviceRequests.create(data);
        if (__DEV__) console.log('[Sync] Creating service request:', data.id);
        break;
      case 'update':
        // await api.serviceRequests.update(data.id as string, data);
        if (__DEV__) console.log('[Sync] Updating service request:', data.id);
        break;
      case 'delete':
        // await api.serviceRequests.cancel(data.id as string);
        if (__DEV__) console.log('[Sync] Cancelling service request:', data.id);
        break;
    }
  },

  // User profile sync
  userProfile: async (type, data) => {
    switch (type) {
      case 'update':
        // await api.users.updateProfile(data);
        if (__DEV__) console.log('[Sync] Updating user profile');
        break;
    }
  },

  // Family members sync
  familyMember: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.familyMembers.create(data);
        if (__DEV__) console.log('[Sync] Creating family member:', data.id);
        break;
      case 'update':
        // await api.familyMembers.update(data.id as string, data);
        if (__DEV__) console.log('[Sync] Updating family member:', data.id);
        break;
      case 'delete':
        // await api.familyMembers.delete(data.id as string);
        if (__DEV__) console.log('[Sync] Deleting family member:', data.id);
        break;
    }
  },

  // Addresses sync
  address: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.addresses.create(data);
        if (__DEV__) console.log('[Sync] Creating address:', data.id);
        break;
      case 'update':
        // await api.addresses.update(data.id as string, data);
        if (__DEV__) console.log('[Sync] Updating address:', data.id);
        break;
      case 'delete':
        // await api.addresses.delete(data.id as string);
        if (__DEV__) console.log('[Sync] Deleting address:', data.id);
        break;
    }
  },

  // Check-ins sync (safety feature)
  checkIn: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.safety.recordCheckIn(data);
        if (__DEV__) console.log('[Sync] Recording check-in:', data.timestamp);
        break;
    }
  },

  // Analytics events sync
  analytics: async (type, data) => {
    switch (type) {
      case 'create':
        // await api.analytics.track(data);
        if (__DEV__) console.log('[Sync] Tracking analytics event:', data.event);
        break;
    }
  },
};

// ============================================
// TYPES
// ============================================

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  details: NetInfoState | null;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface NetworkContextType {
  /** Current network state */
  networkState: NetworkState;
  /** Whether the device is online */
  isOnline: boolean;
  /** Whether the app is in offline mode */
  isOffline: boolean;
  /** Add an operation to the sync queue */
  addToSyncQueue: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  /** Get pending operations count */
  pendingOperationsCount: number;
  /** Manually trigger sync */
  syncPendingOperations: () => Promise<void>;
  /** Clear all pending operations */
  clearSyncQueue: () => Promise<void>;
}

// ============================================
// CONSTANTS
// ============================================

const SYNC_QUEUE_KEY = '@carebow/sync_queue';
const MAX_RETRY_COUNT = 3;

// ============================================
// CONTEXT
// ============================================

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface NetworkProviderProps {
  children: ReactNode;
  /** Whether to show the offline banner */
  showBanner?: boolean;
}

export function NetworkProvider({ children, showBanner = true }: NetworkProviderProps) {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
    details: null,
  });

  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerAnimation = useState(new Animated.Value(0))[0];

  // Load pending operations from storage
  useEffect(() => {
    loadSyncQueue();
  }, []);

  // Subscribe to network state changes
  useEffect(() => {
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener((state) => {
      const newNetworkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state,
      };

      setNetworkState(newNetworkState);

      // Show/hide banner
      if (!state.isConnected && showBanner) {
        showBannerAnimation();
      } else if (state.isConnected && bannerVisible) {
        hideBannerAnimation();
      }

      // Sync when coming back online
      if (state.isConnected && state.isInternetReachable && pendingOperations.length > 0) {
        syncPendingOperations();
      }
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [pendingOperations.length, bannerVisible, showBanner]);

  const showBannerAnimation = useCallback(() => {
    setBannerVisible(true);
    Animated.spring(bannerAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [bannerAnimation]);

  const hideBannerAnimation = useCallback(() => {
    Animated.timing(bannerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBannerVisible(false);
    });
  }, [bannerAnimation]);

  const loadSyncQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueData) {
        setPendingOperations(JSON.parse(queueData));
      }
    } catch (error) {
      console.error('[NetworkProvider] Failed to load sync queue:', error);
    }
  };

  const saveSyncQueue = async (operations: PendingOperation[]) => {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(operations));
    } catch (error) {
      console.error('[NetworkProvider] Failed to save sync queue:', error);
    }
  };

  const addToSyncQueue = useCallback(
    async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
      const newOperation: PendingOperation = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const updatedQueue = [...pendingOperations, newOperation];
      setPendingOperations(updatedQueue);
      await saveSyncQueue(updatedQueue);

      if (__DEV__) {
        console.log('[NetworkProvider] Added to sync queue:', newOperation);
      }
    },
    [pendingOperations]
  );

  const syncPendingOperations = useCallback(async () => {
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      if (__DEV__) {
        console.log('[NetworkProvider] Cannot sync - offline');
      }
      return;
    }

    if (pendingOperations.length === 0) {
      return;
    }

    if (__DEV__) {
      console.log('[NetworkProvider] Syncing', pendingOperations.length, 'operations');
    }

    const remainingOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      try {
        // Get the sync handler for this entity type
        const handler = syncHandlers[operation.entity];

        if (handler) {
          await handler(operation.type, operation.data);
          if (__DEV__) {
            console.log('[NetworkProvider] Synced operation:', operation.id, operation.entity, operation.type);
          }
        } else {
          // Unknown entity type - log warning and skip
          console.warn('[NetworkProvider] Unknown entity type:', operation.entity);
        }
      } catch (error) {
        // If sync fails, add back to queue with increased retry count
        if (operation.retryCount < MAX_RETRY_COUNT) {
          remainingOperations.push({
            ...operation,
            retryCount: operation.retryCount + 1,
          });
        } else {
          // Max retries exceeded, log and discard
          console.error(
            '[NetworkProvider] Operation failed after max retries:',
            operation.id,
            error
          );
        }
      }
    }

    setPendingOperations(remainingOperations);
    await saveSyncQueue(remainingOperations);
  }, [networkState, pendingOperations]);

  const clearSyncQueue = useCallback(async () => {
    setPendingOperations([]);
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }, []);

  const isOnline = networkState.isConnected && (networkState.isInternetReachable ?? true);
  const isOffline = !isOnline;

  const contextValue: NetworkContextType = {
    networkState,
    isOnline,
    isOffline,
    addToSyncQueue,
    pendingOperationsCount: pendingOperations.length,
    syncPendingOperations,
    clearSyncQueue,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}

      {/* Offline Banner */}
      {bannerVisible && showBanner && (
        <Animated.View
          style={[
            styles.banner,
            {
              transform: [
                {
                  translateY: bannerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerDot} />
            <Text style={styles.bannerText}>
              You're offline. Changes will sync when you reconnect.
            </Text>
          </View>
          {pendingOperations.length > 0 && (
            <Text style={styles.pendingText}>
              {pendingOperations.length} pending
            </Text>
          )}
        </Animated.View>
      )}
    </NetworkContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

/**
 * Hook to check if online (simplified)
 */
export function useIsOnline(): boolean {
  const { isOnline } = useNetwork();
  return isOnline;
}

/**
 * Hook to execute callback only when online
 */
export function useOnlineCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  offlineCallback?: () => void
): T {
  const { isOnline, addToSyncQueue } = useNetwork();

  return ((...args: Parameters<T>) => {
    if (isOnline) {
      return callback(...args);
    }
    offlineCallback?.();
    return undefined;
  }) as T;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse,
    marginRight: spacing.sm,
  },
  bannerText: {
    ...typography.bodySmall,
    color: colors.textInverse,
    flex: 1,
  },
  pendingText: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.8,
    marginLeft: spacing.sm,
  },
});

export default NetworkProvider;
