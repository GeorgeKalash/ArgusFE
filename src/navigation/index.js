const navigation = () => {
  return [
    {
      title: 'Dashboards',
      icon: 'mdi:home-outline',
      badgeContent: 'new',
      badgeColor: 'error',
      children: [
        {
          title: 'CRM',
          path: '/dashboards/crm'
        },
        {
          title: 'Analytics',
          path: '/dashboards/analytics'
        },
        {
          title: 'eCommerce',
          path: '/dashboards/ecommerce'
        }
      ]
    },
  ]
}

export default navigation
