import { useContext } from 'react'
import { AbilityContext } from 'src/layouts/components/acl/Can'

const CanViewNavLink = props => {
  const { children, navLink } = props

  const ability = useContext(AbilityContext)
  if (navLink && navLink.auth === false) {
    return <>{children}</>
  } else {
    return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null
  }
}

export default CanViewNavLink
