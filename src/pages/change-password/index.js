import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import ChangePassword from 'src/components/Shared/ChangePassword'
import { AuthContext } from 'src/providers/AuthContext'
import { useContext } from 'react'

const ChangePass = () => {
  const { encryptePWD, loggedUser } = useContext(AuthContext)

  return (
    <ImmediateWindow
      datasetId={ResourceIds.ChangePassword}
      props={(encryptePWD, loggedUser)}
      titleName={'ChangePassword'}
      Component={ChangePassword}
    />
  )
}

export default ChangePass
