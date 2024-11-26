import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import IrDefaultForm from './form/IrDefaultForm'

const IrIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.IrDefault} labelKey={'iRd'} Component={IrDefaultForm} />
}

export default IrIndex
