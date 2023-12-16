// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupsTab from '../Tabs/GroupsTab'

const GroupsWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    GroupsValidation,
    labels,
    maxAccess,
    setNumberRangeStore,
    numberRangeStore,
    lookupNumberRange,
    tabs,
    activeTab,
    setActiveTab
}) => { console.log(GroupsValidation)

return (

    <Window
    id=''
    Title={labels.title}
    tabs={tabs}

    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    GroupsValidation={GroupsValidation}
    typeStore={typeStore}
    activeTab={activeTab}
    setActiveTab={setActiveTab}

    >
              <CustomTabPanel index={0} value={activeTab}>

           <GroupsTab
              labels={labels}
              GroupsValidation={GroupsValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
              lookupNumberRange={lookupNumberRange}
              setNumberRangeStore={setNumberRangeStore}
              numberRangeStore={numberRangeStore}
              editMode={editMode}
              tabs={tabs}

           />
           </CustomTabPanel>

           <CustomTabPanel index={1} value={activeTab}>

test
</CustomTabPanel>
        </Window>
     )
}

export default GroupsWindow
