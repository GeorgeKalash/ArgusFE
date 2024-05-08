// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import JournalVoucherForm from '../forms/JournalVoucherForm'

const JournalVoucherWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='JournalVoucherWindow'
      Title={labels.generalJournal}
      controlled={true}
      onClose={onClose}
      width={500}
      height={500}
    >
      <JournalVoucherForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default JournalVoucherWindow
