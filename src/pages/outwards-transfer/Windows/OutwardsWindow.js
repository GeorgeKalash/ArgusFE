// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import OutwardsTab from '../Tabs/OutwardsTab'

export default function OutwardsWindow({ onClose, labels, recordId, maxAccess }) {
  return (
    <Window id='OutwardsWindow' Title='outwards' onClose={onClose} width='600px' height='500px'>
      <OutwardsTab labels={labels} maxAccess={maxAccess} />
    </Window>
  )
}
