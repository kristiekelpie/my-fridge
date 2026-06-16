'use client'

import { createContext, useContext } from 'react'

export const StoragePanelActiveContext = createContext(true)

export function useStoragePanelActive() {
  return useContext(StoragePanelActiveContext)
}
