import React, { useEffect, useMemo } from 'react'
import DynamicDashboard from '@argus/module-auth/src/pages/dynamicDashboard'
import DeliveryDashboard from '@argus/module-auth/src/pages/deliveryDashboard'
import SalesPersonDashboard from '@argus/module-auth/src/pages/salesPersonDashboard'

const Home = React.memo(() => {
  const dashboardRef = React.useRef(null)

  useEffect(() => {
  console.log('HOME MOUNTED')
  return () => console.log('HOME UNMOUNTED')
}, [])


  if (!dashboardRef.current) {
    const userData = JSON.parse(
      window.sessionStorage.getItem('userData') || '{}'
    )

    switch (userData?.dashboardId) {
      case 1:
        dashboardRef.current = <DynamicDashboard />
        break
      case 2:
        dashboardRef.current = <SalesPersonDashboard />
        break
      case 3:
        dashboardRef.current = <DeliveryDashboard />
        break
      default:
        dashboardRef.current = null
    }
  }

  return dashboardRef.current
})

export default Home
