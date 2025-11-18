import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import ChangePassword from '@argus/shared-ui/components/Shared/ChangePassword'

const ChangePass = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.ChangePassword} labelKey={'ChangePassword'} Component={ChangePassword} />
  )
}

export default ChangePass
