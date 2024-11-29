import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import SystemParamsForm from './form/SystemParamsForm'

const SystemParams = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.SystemParams} labelKey={'gsp'} Component={SystemParamsForm} height={700} />
  )
}

export default SystemParams
