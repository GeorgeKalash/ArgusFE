export const executeAction = async (actionConfig) => {
  if (!actionConfig) return

  switch (actionConfig.type) {
    case 'OPEN_STACK':
      return actionConfig.handler?.(actionConfig.params)

    case 'OPEN_URL':
      return window.open(actionConfig.params.url, '_blank')

    case 'API_CALL':
     //call api

    default:
      console.warn('Unknown action type', actionConfig.type)
  }
}