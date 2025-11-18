import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import IrDefaultForm from './form/IrDefaultForm'

const IrDefaults = () => {
  return <ImmediateWindow datasetId={ResourceIds.IrDefault} labelKey={'iRd'} Component={IrDefaultForm} />
}

export default IrDefaults
