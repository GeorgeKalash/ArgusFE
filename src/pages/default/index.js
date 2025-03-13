import React from 'react'
import DynamicDashboard from '../dynamicDashboard'
import DeliveryDashboard from '../deliveryDashboard'

import SalesPersonDashboard from '../salesPersonDashboard'

const Home = () => {
  const { dashboardId } = JSON.parse(window.sessionStorage.getItem('userData'))

  return (
    <>
      {dashboardId === 1 && <DynamicDashboard />}
      {dashboardId === 2 && <SalesPersonDashboard />}
      {dashboardId === 3 && <DeliveryDashboard />}
    </>
  )
}

export default Home
