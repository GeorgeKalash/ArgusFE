import React from 'react'
import DynamicDashboard from '../dynamicDashboard'
import SalesPersonDashboard from '../salesPersonDashboard'

const Home = () => {
  const { dashboardId } = JSON.parse(window.sessionStorage.getItem('userData'))

  return (
    <>
      {dashboardId === 2 && <SalesPersonDashboard />}
      {dashboardId === 1 && <DynamicDashboard />}
    </>
  )
}

export default Home
