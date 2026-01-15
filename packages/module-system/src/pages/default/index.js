import React, { useMemo } from 'react'
import DynamicDashboard from '@argus/module-auth/src/pages/dynamicDashboard'
import DeliveryDashboard from '@argus/module-auth/src/pages/deliveryDashboard'
import SalesPersonDashboard from '@argus/module-auth/src/pages/salesPersonDashboard'

const Home = () => {
  const userData = useMemo(() => {
    if (typeof window === 'undefined') return {}
      return JSON.parse(window.sessionStorage.getItem('userData') || '{}')
  
  }, [])

  const dashboardId = userData?.dashboardId

  const dashboard = useMemo(() => {
    switch (dashboardId) {
      case 1:
        return <DynamicDashboard />
      case 2:
        return <SalesPersonDashboard />
      case 3:
        return <DeliveryDashboard />
      default:
        return null
    }
  }, [dashboardId])

  return <>{dashboard}</>
}

export default Home
