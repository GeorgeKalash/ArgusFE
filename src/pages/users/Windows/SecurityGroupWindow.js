// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'

const SecurityGroupWindow = ({
  onClose,
  formik,
  onSave,
  initialAllListData,
  initialSelectedListData,
  itemSelectorLabels,
  handleListsDataChange
}) => {
  return (
    <Window width={600} height={500} onClose={onClose} onSave={onSave} Title={itemSelectorLabels[0]}>
      <ItemSelectorWindow
        initialAllListData={initialAllListData}
        initialSelectedListData={initialSelectedListData}
        handleListsDataChange={handleListsDataChange}
        formik={formik}
        itemSelectorLabels={itemSelectorLabels}
      />
    </Window>
  )
}

export default SecurityGroupWindow
