// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'

const SecurityGroupWindow = ({
  onClose,
  onSave,
  initialAllListData,
  initialSelectedListData,
  labels,
  handleListsDataChange
}) => {
  return (
    <Window width={600} height={400} onClose={onClose} onSave={onSave} Title={labels.securityGrp}>
    <ItemSelectorWindow
          initialAllListData={initialAllListData}
          initialSelectedListData={initialSelectedListData}
          handleListsDataChange={handleListsDataChange} 
          labels={labels}      
        />
        </Window>
  )
}

export default SecurityGroupWindow
