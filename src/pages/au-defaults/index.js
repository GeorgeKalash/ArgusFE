import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import AUDefaultsForm from './Form/AUDefaultsForm'

const AUDefaults = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.AUDefaults}
      labelKey={'defaults'}
      Component={AUDefaultsForm}
    />
  )
}

export default AUDefaults
