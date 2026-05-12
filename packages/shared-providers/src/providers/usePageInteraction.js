import { useContext, useCallback } from 'react'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { useInteractionTracker } from '@argus/shared-providers/src/providers/InteractionTrackerProvider'

const usePageInteraction = () => {
  const { track } = useInteractionTracker()
  const menuContext = useContext(MenuContext)

  const openTabs = menuContext?.openTabs || []
  const currentTabIndex = menuContext?.currentTabIndex ?? null

  const currentPageResourceId =
    openTabs?.[currentTabIndex]?.resourceId || null

  const trackInteraction = useCallback(
    (source = null) => {
      if (currentPageResourceId) {
        track(currentPageResourceId, source)
      }
    },
    [track, currentPageResourceId]
  )

  return trackInteraction
}

export default usePageInteraction