import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import IrDefaultForm from './form/IrDefaultForm'

const IrDefaults = () => {
  return <ImmediateWindow datasetId={ResourceIds.IrDefault} labelKey={'iRd'} Component={IrDefaultForm} />
}

export default IrDefaults
