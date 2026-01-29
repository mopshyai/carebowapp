/**
 * Service Request Store Tests
 * Tests for service request management
 */

import { act, renderHook } from '@testing-library/react-native';
import { useServiceRequestStore } from './useServiceRequestStore';
import type { ServiceRequest, BookingDraft } from '@/data/types';

// Helper to reset store state between tests
const resetStore = () => {
  useServiceRequestStore.setState({
    requests: [],
  });
};

// Mock booking draft for testing
const createMockDraft = (overrides?: Partial<BookingDraft>): BookingDraft => ({
  serviceId: 'service-123',
  serviceTitle: 'Nursing Care',
  memberId: 'member-1',
  memberName: 'John Doe',
  date: '2025-01-25',
  startTime: '09:00',
  endTime: '17:00',
  durationMinutes: 480,
  requestNotes: 'Patient needs assistance with daily activities',
  ...overrides,
});

describe('useServiceRequestStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with empty requests', () => {
      const { result } = renderHook(() => useServiceRequestStore());
      expect(result.current.requests).toEqual([]);
    });
  });

  describe('Create Request', () => {
    it('createRequest creates a new service request', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      expect(result.current.requests).toHaveLength(1);
      expect(request!.serviceId).toBe('service-123');
      expect(request!.serviceTitle).toBe('Nursing Care');
      expect(request!.status).toBe('submitted');
    });

    it('createRequest generates unique ID', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request1: ServiceRequest;
      let request2: ServiceRequest;
      act(() => {
        request1 = result.current.createRequest(draft);
        request2 = result.current.createRequest(draft);
      });

      expect(request1!.id).not.toBe(request2!.id);
      expect(request1!.id).toMatch(/^req_/);
    });

    it('createRequest includes member details', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft({
        memberId: 'member-456',
        memberName: 'Jane Doe',
      });
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      expect(request!.memberId).toBe('member-456');
      expect(request!.memberName).toBe('Jane Doe');
    });

    it('createRequest includes booking details', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft({
        date: '2025-02-01',
        startTime: '10:00',
        endTime: '18:00',
        durationMinutes: 480,
      });
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      expect(request!.date).toBe('2025-02-01');
      expect(request!.startTime).toBe('10:00');
      expect(request!.endTime).toBe('18:00');
      expect(request!.durationMinutes).toBe(480);
    });

    it('createRequest handles booking fee', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft, true, 500, 'payment-123');
      });

      expect(request!.bookingFeePaid).toBe(true);
      expect(request!.bookingFeeAmount).toBe(500);
      expect(request!.bookingFeePaymentId).toBe('payment-123');
    });

    it('createRequest sets timestamps', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      expect(request!.createdAt).toBeDefined();
      expect(request!.updatedAt).toBeDefined();
      expect(new Date(request!.createdAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Update Request Status', () => {
    it('updateRequestStatus updates status', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      act(() => {
        result.current.updateRequestStatus(request!.id, 'confirmed');
      });

      expect(result.current.requests[0].status).toBe('confirmed');
    });

    it('updateRequestStatus updates timestamp', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      const originalUpdatedAt = new Date(result.current.requests[0].updatedAt).getTime();

      act(() => {
        result.current.updateRequestStatus(request!.id, 'confirmed');
      });

      const newUpdatedAt = new Date(result.current.requests[0].updatedAt).getTime();
      expect(newUpdatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('updateRequestStatus handles all status types', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const statuses: Array<'submitted' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'> = [
        'submitted',
        'quoted',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
      ];

      for (const status of statuses) {
        const draft = createMockDraft();
        let request: ServiceRequest;
        act(() => {
          request = result.current.createRequest(draft);
        });

        act(() => {
          result.current.updateRequestStatus(request!.id, status);
        });

        const updated = result.current.getRequestById(request!.id);
        expect(updated?.status).toBe(status);
      }
    });
  });

  describe('Update Request Quote', () => {
    it('updateRequestQuote sets quoted price', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      act(() => {
        result.current.updateRequestQuote(request!.id, 5000);
      });

      expect(result.current.requests[0].quotedPrice).toBe(5000);
    });

    it('updateRequestQuote sets status to quoted', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      act(() => {
        result.current.updateRequestQuote(request!.id, 5000);
      });

      expect(result.current.requests[0].status).toBe('quoted');
    });
  });

  describe('Mark Booking Fee Paid', () => {
    it('markBookingFeePaid updates payment details', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      act(() => {
        result.current.markBookingFeePaid(request!.id, 'payment-xyz', 250);
      });

      expect(result.current.requests[0].bookingFeePaid).toBe(true);
      expect(result.current.requests[0].bookingFeePaymentId).toBe('payment-xyz');
      expect(result.current.requests[0].bookingFeeAmount).toBe(250);
    });
  });

  describe('Getters', () => {
    it('getRequestById returns correct request', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const draft = createMockDraft();
      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(draft);
      });

      const found = result.current.getRequestById(request!.id);
      expect(found?.id).toBe(request!.id);
    });

    it('getRequestById returns undefined for non-existent id', () => {
      const { result } = renderHook(() => useServiceRequestStore());
      const found = result.current.getRequestById('non-existent');
      expect(found).toBeUndefined();
    });

    it('getRequestsByService returns requests for service', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      act(() => {
        result.current.createRequest(createMockDraft({ serviceId: 'service-1' }));
        result.current.createRequest(createMockDraft({ serviceId: 'service-2' }));
        result.current.createRequest(createMockDraft({ serviceId: 'service-1' }));
      });

      const service1Requests = result.current.getRequestsByService('service-1');
      expect(service1Requests).toHaveLength(2);
    });

    it('getRequestsByStatus returns requests with status', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      let req1: ServiceRequest;
      let req2: ServiceRequest;
      act(() => {
        req1 = result.current.createRequest(createMockDraft());
        req2 = result.current.createRequest(createMockDraft());
        result.current.createRequest(createMockDraft());
      });

      act(() => {
        result.current.updateRequestStatus(req1!.id, 'confirmed');
        result.current.updateRequestStatus(req2!.id, 'confirmed');
      });

      const confirmed = result.current.getRequestsByStatus('confirmed');
      expect(confirmed).toHaveLength(2);
    });

    it('getPendingRequests returns submitted requests', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      let req1: ServiceRequest;
      act(() => {
        result.current.createRequest(createMockDraft());
        req1 = result.current.createRequest(createMockDraft());
        result.current.createRequest(createMockDraft());
      });

      act(() => {
        result.current.updateRequestStatus(req1!.id, 'confirmed');
      });

      const pending = result.current.getPendingRequests();
      expect(pending).toHaveLength(2); // 2 still submitted, 1 confirmed
    });
  });

  describe('Clear Requests', () => {
    it('clearRequests removes all requests', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      act(() => {
        result.current.createRequest(createMockDraft());
        result.current.createRequest(createMockDraft());
        result.current.createRequest(createMockDraft());
      });

      expect(result.current.requests).toHaveLength(3);

      act(() => {
        result.current.clearRequests();
      });

      expect(result.current.requests).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional fields in draft', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      const minimalDraft: BookingDraft = {
        serviceId: 'service-123',
        serviceTitle: 'Basic Service',
      };

      let request: ServiceRequest;
      act(() => {
        request = result.current.createRequest(minimalDraft);
      });

      expect(request!.memberId).toBe('');
      expect(request!.memberName).toBe('');
      expect(request!.date).toBe('');
      expect(request!.endTime).toBeUndefined();
    });

    it('updating non-existent request does not throw', () => {
      const { result } = renderHook(() => useServiceRequestStore());

      expect(() => {
        act(() => {
          result.current.updateRequestStatus('non-existent', 'confirmed');
        });
      }).not.toThrow();
    });
  });
});
