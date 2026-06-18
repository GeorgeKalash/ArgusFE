import { useContext, useCallback } from 'react'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { useInteractionTracker } from '@argus/shared-providers/src/providers/InteractionTrackerProvider'

const usePageInteraction = () => {
  const { track, trackFieldState, getPageState } = useInteractionTracker()

  const menuContext = useContext(MenuContext)
  const openTabs = menuContext?.openTabs || []
  const currentTabIndex = menuContext?.currentTabIndex

  const currentPageResourceId = (currentTabIndex != null || currentTabIndex != '' || currentTabIndex != undefined)  &&
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

  trackInteraction.trackPageFields = (fieldValues, initialValues = null, source = null) => {
    if (!currentPageResourceId) return false

    trackFieldState(currentPageResourceId, fieldValues, initialValues, source)
    
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