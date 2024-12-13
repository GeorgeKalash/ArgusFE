import { useContext } from 'react'
import { AbilityContext } from 'src/layouts/components/acl/Can'

const CanViewNavGroup = props => {
  const { children, navGroup } = props

  const ability = useContext(AbilityContext)

  const canViewMenuGroup = item => {
    const hasAnyVisibleChild = item.children && item.children.some(i => ability && ability.can(i.action, i.subject))
    if (!(item.action && item.subject)) {
      return hasAnyVisibleChild
    }

    return ability && ability.can(item.action, item.subject) && hasAnyVisibleChild
  }
  if (navGroup && navGroup.auth === false) {
    return <>{children}</>
  } else {
    return navGroup && canViewMenuGroup(navGroup) ? <>{children}</> : null
  }
}

export default CanViewNavGroup
