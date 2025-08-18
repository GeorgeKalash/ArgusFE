import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import RebuildAgingForm from './Forms/RebuildAgingForm'

const RebuildAging = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.RebuildAging}
      labelKey={'rebuildAging'}
      Component={RebuildAgingForm}
    />
  )
}

export default RebuildAging