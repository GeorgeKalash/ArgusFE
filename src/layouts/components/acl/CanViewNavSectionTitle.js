import { useContext } from 'react'
import { AbilityContext } from 'src/layouts/components/acl/Can'

const CanViewNavSectionTitle = props => {
  const { children, navTitle } = props

  const ability = useContext(AbilityContext)
  if (navTitle && navTitle.auth === false) {
    return <>{children}</>
  } else {
    return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null
  }
}

export default CanViewNavSectionTitle
