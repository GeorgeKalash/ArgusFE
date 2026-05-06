import { useContext, useCallback } from 'react'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { useInteractionTracker } from '@argus/shared-providers/src/providers/InteractionTrackerProvider'

const usePageInteraction = () => {
  const { track } = useInteractionTracker()
  const { openTabs, currentTabIndex } = useContext(MenuContext)

  const currentPageResourceId =
    openTabs?.[currentTabIndex]?.resourceId || null

  const trackInteraction = useCallback(() => {
    if (currentPageResourceId) {
      track(currentPageResourceId)
    }
  }, [track, currentPageResourceId])

  return trackInteraction
}

export default usePageInteraction