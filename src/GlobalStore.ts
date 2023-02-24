import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Storage } from '@ionic/storage';

export interface IGlobalStoreState {
  isZoomed: boolean
  setIsZoomed: (value: boolean) => void
  dbstorage: Storage | null, 
  setdbstorage: (value: Storage) => void
  media: string[]
  setMedia: (value: string[]) => void
}

export const useGlobalStore = create<IGlobalStoreState>()(
  devtools(
    (set) => ({
      isZoomed: false,
      setIsZoomed: (value) => set((state) => ({ isZoomed: value })),
      dbstorage: null,
      setdbstorage: (value) => set((state) => ({ dbstorage: value })),
      media: [],
      setMedia: (value) => set((state) => ({ media: value })),
    })
  )
)