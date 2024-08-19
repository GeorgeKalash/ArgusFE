import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import ChangePassword from 'src/components/Shared/ChangePassword'

const ChangePass = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.ChangePassword} labelKey={'ChangePassword'} Component={ChangePassword} />
  )
}

export default ChangePass
