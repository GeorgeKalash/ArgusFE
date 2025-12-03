import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GenFiscalForm from './form/GenFiscalForm'

const GenYearIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.GenerateFiscalYear} labelKey={'fiscal'} Component={GenFiscalForm} />
}

export default GenYearIndex
