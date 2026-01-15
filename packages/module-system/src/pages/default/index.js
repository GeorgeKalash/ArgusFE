import React, { useMemo, useRef } from 'react'
import DynamicDashboard from '@argus/module-auth/src/pages/dynamicDashboard'
import DeliveryDashboard from '@argus/module-auth/src/pages/deliveryDashboard'
import SalesPersonDashboard from '@argus/module-auth/src/pages/salesPersonDashboard'

const Home = () => {
  const userData = useMemo(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(window.sessionStorage.getItem('userData') || '{}')
    } catch {
      return {}
    }
  }, [])

  const dashboardId = userData?.dashboardId

  const cachedDashboardRef = useRef(null)

  const dashboardKey = dashboardId || 'none'
  if (!cachedDashboardRef.current || cachedDashboardRef.current.key !== dashboardKey) {
    let element = null

    switch (dashboardId) {
      case 1:
        element = <DynamicDashboard />
        break
      case 2:
        element = <SalesPersonDashboard />
        break
      case 3:
        element = <DeliveryDashboard />
        break
      default:
        element = null
    }

    cachedDashboardRef.current = { key: dashboardKey, element }
  }

  return <>{cachedDashboardRef.current.element}</>
}

export default Home
