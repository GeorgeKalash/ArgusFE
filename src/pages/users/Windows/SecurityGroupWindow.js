// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'

const SecurityGroupWindow = ({
  onClose,
  onSave,
  initialAllListData,
  initialSelectedListData,
  itemSelectorLabels,
  handleListsDataChange
}) => {
  return (
    <Window width={600} height={400} onClose={onClose} onSave={onSave} Title={itemSelectorLabels[0]}>
    <ItemSelectorWindow
          initialAllListData={initialAllListData}
          initialSelectedListData={initialSelectedListData}
          handleListsDataChange={handleListsDataChange} 
          itemSelectorLabels={itemSelectorLabels}      
        />
        </Window>
  )
}

export default SecurityGroupWindow
