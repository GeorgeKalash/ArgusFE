import React from 'react'
import DynamicDashboard from '../dynamicDashboard'
import DeliveryDashboard from '../deliveryDashboard'
import SalesPersonDashboard from '../salesPersonDashboard'

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
