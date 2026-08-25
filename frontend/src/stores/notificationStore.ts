import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationState {
  hasUnreadOrders: boolean
  readReviewIds: number[]
  clearedAllAt: number | null

  // Actions to dismiss / clear notifications
  markOrdersAsRead: () => void
  markReviewAsRead: (reviewId: number) => void
  markAllReviewsAsRead: (reviewIds: number[]) => void
  clearAllNotifications: () => void
  resetNotifications: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      hasUnreadOrders: true,
      readReviewIds: [],
      clearedAllAt: null,

      markOrdersAsRead: () => set({ hasUnreadOrders: false }),

      markReviewAsRead: (reviewId: number) =>
        set((state) => ({
          readReviewIds: state.readReviewIds.includes(reviewId)
            ? state.readReviewIds
            : [...state.readReviewIds, reviewId],
        })),

      markAllReviewsAsRead: (reviewIds: number[]) =>
        set({ readReviewIds: reviewIds }),

      clearAllNotifications: () =>
        set({
          hasUnreadOrders: false,
          readReviewIds: [101, 102, 103, 104, 105],
          clearedAllAt: Date.now(),
        }),

      resetNotifications: () =>
        set({
          hasUnreadOrders: true,
          readReviewIds: [],
          clearedAllAt: null,
        }),
    }),
    {
      name: 'platform_notifications_state_v1',
    },
  ),
)
