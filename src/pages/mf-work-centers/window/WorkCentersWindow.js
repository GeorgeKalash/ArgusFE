import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import WorkCentersForm from '../forms/WorkCentersForm'

const WorkCentersWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='WorkCentersWindow' Title={labels.workCenter} controlled={true} onClose={onClose} width={600}>
      <CustomTabPanel>
        <WorkCentersForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default WorkCentersWindow
