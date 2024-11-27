import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import IrDefaultForm from './form/IrDefaultForm'

const IrDefaults = () => {
  return <ImmediateWindow datasetId={ResourceIds.IrDefault} labelKey={'iRd'} Component={IrDefaultForm} />
}

export default IrDefaults
