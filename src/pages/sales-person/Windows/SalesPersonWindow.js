// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeneralForm from 'src/pages/sales-person/Forms/GeneralForm'
import TargetForm from 'src/pages/sales-person/Forms/TargetForm'

const SalesPersonWindow = ({
    onClose,
    labels,
    maxAccess,
    recordId,
    setErrorMessage,
    tabs,
    activeTab,
    setActiveTab,
}) => {

  return (
    <>
      <Window
          id='SalesPerson'
          Title={labels[1]}
          controlled={true}
          onClose={onClose}
          width={600}
          height={450}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
      >
        <CustomTabPanel index={0} value={activeTab}>
          <GeneralForm
           labels={labels}
           maxAccess={maxAccess}
           setErrorMessage={setErrorMessage}
           recordId={recordId}
          />
        </CustomTabPanel>

        <CustomTabPanel index={1} value={activeTab}>
          <TargetForm
             labels={labels}
             setErrorMessage={setErrorMessage}
             maxAccess={maxAccess}
             recordId={recordId}
          />
        </CustomTabPanel>
      </Window>    
    </>
  )
}

export default SalesPersonWindow