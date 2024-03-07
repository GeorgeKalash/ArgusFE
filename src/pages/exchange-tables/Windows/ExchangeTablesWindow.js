import Window from 'src/components/Shared/Window'
import ExchangeTablesForm from '../forms/ExchangeTablesForm'

const ExchangeTablesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='ExchangeTablesWindow'
      Title={labels.ExchangeTables}
      controlled={true}
      onClose={onClose}
      width={500}
      height={500}
    >
      <ExchangeTablesForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default ExchangeTablesWindow
