import Window from 'src/components/Shared/Window'
import GeographicRegionsForm from '../forms/GeographicRegionsForm'

const GeographicRegionsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='GeographicRegionsWindow'
      Title={labels.GeographicRegions}
      controlled={true}
      onClose={onClose}
      width={500}
    >
      <GeographicRegionsForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default GeographicRegionsWindow
