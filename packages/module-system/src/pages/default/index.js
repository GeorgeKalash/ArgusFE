import React from 'react'
import DynamicDashboard from '@argus/module-auth/src/pages/dynamicDashboard'
import DeliveryDashboard from '@argus/module-auth/src/pages/deliveryDashboard'
import SalesPersonDashboard from '@argus/module-auth/src/pages/salesPersonDashboard'

const Home = () => {
  const { dashboardId } = JSON.parse(window.sessionStorage.getItem('userData'))

  const renderDashboard = () => {
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
  }

  return <>{renderDashboard()}</>
}

export default Home
