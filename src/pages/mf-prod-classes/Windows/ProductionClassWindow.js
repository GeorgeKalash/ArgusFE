import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ProductionClassForm from '../forms/ProductionClassForm'
import SFItemForm from '../forms/SFItemForm'

const ProductionClassWindow = ({ 
  onClose,
  labels,
  maxAccess,
  recordId,
  setErrorMessage,
  tabs,
  activeTab,
  setActiveTab,
  editMode,
  setEditMode,
  setSelectedRecordId }) => {
  return (
    <Window
      id='productionClass'
      Title={labels.prodClass}
      controlled={true}
      onClose={onClose}
      width={600}
      height={400}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <ProductionClassForm labels={labels} maxAccess={maxAccess} recordId={recordId} setErrorMessage={setErrorMessage} editMode={editMode}
           setEditMode={setEditMode}
           setSelectedRecordId={setSelectedRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
          <SFItemForm
             labels={labels}
             setErrorMessage={setErrorMessage}
             maxAccess={maxAccess}
             recordId={recordId}
             setSelectedRecordId={setSelectedRecordId}
          />
        </CustomTabPanel>
    </Window>
  )
}

export default ProductionClassWindow
