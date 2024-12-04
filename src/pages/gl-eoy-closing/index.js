import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import GlEoyClosingForm from './form/GLClosingForm'

const GlEoyClosing = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.GlEoyClosing} labelKey={'eoy'} Component={GlEoyClosingForm} height={300} />
  )
}

export default GlEoyClosing
