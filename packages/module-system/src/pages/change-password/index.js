import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ChangePassword from '@argus/shared-ui/src/components/Shared/ChangePassword'

const ChangePass = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.ChangePassword} labelKey={'ChangePassword'} Component={ChangePassword} />
  )
}

export default ChangePass
