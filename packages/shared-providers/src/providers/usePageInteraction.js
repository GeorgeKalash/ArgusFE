import { useContext, useCallback } from 'react'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { useInteractionTracker } from '@argus/shared-providers/src/providers/InteractionTrackerProvider'

const usePageInteraction = () => {
  const { track, trackFieldState, getPageState } = useInteractionTracker()

  const menuContext = useContext(MenuContext)
  const openTabs = menuContext?.openTabs || []
  const currentTabIndex = menuContext?.currentTabIndex

  const currentPageResourceId = currentTabIndex &&
    openTabs?.[currentTabIndex]?.resourceId
      ? openTabs[currentTabIndex].resourceId
      : null

  const isReady = !!currentPageResourceId

  const trackInteraction = useCallback(
    (source = null) => {
      if (!currentPageResourceId) return false

      track(currentPageResourceId, source)
      return true
    },
    [track, currentPageResourceId]
  )

  trackInteraction.trackPageFields = fieldValues => {
    console.log('currentPageResourceId',currentPageResourceId)
    if (!currentPageResourceId) return false

    trackFieldState(currentPageResourceId, fieldValues)
    return true
  }

  trackInteraction.getCurrentPageState = () => {
    if (!currentPageResourceId) return null
    return getPageState(currentPageResourceId)
  }

  trackInteraction.currentPageResourceId = currentPageResourceId
  trackInteraction.isReady = isReady

  return trackInteraction
}

export default usePageInteraction