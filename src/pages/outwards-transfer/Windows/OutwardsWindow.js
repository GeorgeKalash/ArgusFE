// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import OutwardsTab from '../Tabs/OutwardsTab'

export default function OutwardsWindow({ onClose, labels, recordId, maxAccess, setProductsWindowOpen }) {
  return (
    <Window id='OutwardsWindow' Title='outwards' onClose={onClose} controlled={true} width='700px' height='480px'>
      <OutwardsTab labels={labels} maxAccess={maxAccess} setProductsWindowOpen={setProductsWindowOpen} />
    </Window>
  )
}
