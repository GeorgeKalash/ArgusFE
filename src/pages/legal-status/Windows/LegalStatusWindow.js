// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import LegalStatusTab from 'src/pages/legal-status/Tabs/legalStatusTab'


const LegalStatusWindow = ({
    onClose,
    onSave,
    tabs,
    activeTab,
    setActiveTab,
    legalStatusValidation,
    width,
    height,
    _labels
}) => {
    return (
      <Window id='LegalStatusWindow' Title={_labels.legalStatus} onClose={onClose} width={width} height={height} 
      onSave={onSave} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
         <CustomTabPanel index={0} value={activeTab}>
             <LegalStatusTab
                 legalStatusValidation={legalStatusValidation}
                 _labels={_labels}
             />
         </CustomTabPanel>
     </Window>
    )
}


export default LegalStatusWindow
