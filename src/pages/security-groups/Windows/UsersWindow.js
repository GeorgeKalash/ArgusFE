// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'

const UsersWindow = ({
  onClose,
  onSave,
  initialAllListData,
  initialSelectedListData,
  firstTitle,
  secondTitle,
  title,
  handleListsDataChange
}) => {
  return (
    <Window width={600} height={400} onClose={onClose} onSave={onSave} Title={title}>
    <ItemSelectorWindow
          initialAllListData={initialAllListData}
          initialSelectedListData={initialSelectedListData}
          handleListsDataChange={handleListsDataChange} 
          firstTitle={firstTitle}
          secondTitle={secondTitle}
        />
        </Window>
  )
}

export default UsersWindow
