// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AccountsForm from '../forms/AccountsForm'
import DimensionsForm from '../forms/DimensionsForm'
import CreditLimitsForm from '../forms/CreditLimitsForm'
import AccountBalanceForm from '../forms/AccountBalanceForm'
import { useState } from 'react'
import { height } from '@mui/system'
import { now } from 'moment'


const AccountsWindow = ({
    height,
    recordId,
    labels,
    maxAccess,
    expanded
}) => {
  
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store , setStore] = useState({
    recordId : recordId || null,
    currencies: null,
  })

  return (
    
    <Window
      id='AccountsWindow'
      Title={labels.Accounts}
      controlled={true}
      onClose={onClose}
      width={600}
      height={550}
      tabs={[
        { label: labels.Accounts },
        { label: labels.Dimensions, disabled: !editMode },
        { label: labels.CreditLimits, disabled: !editMode },
        { label: labels.AccountBalance, disabled: !editMode },
      ]}
      activeTab={activeTab}
      setActiveTab={setActiveTab}

    >
      <CustomTabPanel index={0} value={activeTab}>
      <AccountsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
      <DimensionsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
      <CreditLimitsForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          height={height}
        />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
      <AccountBalanceForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default AccountsWindow


// // ** Custom Imports
// import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
// import { CustomTabs } from 'src/components/Shared/CustomTabs'
// import { useState } from 'react'
// import IdTypesForm from '../forms/IdTypesForm'
// import IdFieldsForm from '../forms/IdFieldsForm'

// const IdTypesWindow = ({
//   height,
//   recordId,
//   labels,
//   maxAccess,
//   expanded
// }) => {
//   const [activeTab , setActiveTab] = useState(0)
//   const [editMode, setEditMode] = useState(recordId)

//   const [store , setStore] = useState({
//     recordId : recordId || null,
//     IdField: null,
//   })

//   const tabs = [
//     { label: labels.main },
//     { label: labels.idFields, disabled: !store.recordId },
//   ]

//   return (
//     <>
//       <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
//       <CustomTabPanel height={height} index={0} value={activeTab}>
//         <IdTypesForm
//           labels={labels}
//           setEditMode={setEditMode}
//           setStore={setStore}
//           store={store}
//           editMode={editMode}
//           maxAccess={maxAccess}
//         />
//       </CustomTabPanel>
//       <CustomTabPanel height={height} index={1} value={activeTab}>
//         <IdFieldsForm
//           store={store}
//           setStore={setStore}
//           labels={labels}
//           maxAccess={maxAccess}
//           height={height}
//           expanded={expanded}
//           editMode={editMode}
//         />
//       </CustomTabPanel>
//     </>
//   )
// }

// export default IdTypesWindow
