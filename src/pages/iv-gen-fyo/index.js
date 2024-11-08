import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import GenFiscalForm from './form/GenFiscalForm'

const GenYearIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.GenerateFiscalYear} labelKey={'fiscal'} Component={GenFiscalForm} />
}

export default GenYearIndex
