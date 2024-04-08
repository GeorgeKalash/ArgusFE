// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import IdTypesForm from '../forms/IdTypesForm'
import IdFieldsForm from '../forms/IdFieldsForm'

const IdTypesWindow = ({
  height,
  recordId,
  labels,
  maxAccess,
  expanded
}) => {
  const [activeTab , setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store , setStore] = useState({
    recordId : recordId || null,
    IdField: null,
  })

  const tabs = [
    { label: labels.main },
    { label: labels.idFields, disabled: !store.recordId },
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <IdTypesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <IdFieldsForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
    </>
  )
}

export default IdTypesWindow


// // ** Custom Imports
// import Window from 'src/components/Shared/Window'
// import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
// import IdTypesTab from 'src/pages/id-types/Tabs/IdTypesTab'
// import IdFieldsTab from 'src/pages/id-types/Tabs/IdFieldsTab'
// import TransactionLog from 'src/components/Shared/TransactionLog'
// import { useState } from 'react'
// import { ResourceIds } from 'src/resources/ResourceIds'

// const IdTypesWindow = ({
//   onClose,
//   width,
//   height,
//   tabs,
//   activeTab,
//   setActiveTab,
//   onSave,
//   idTypesValidation,
//   labels,
//   idtId,
//   maxAccess,
//   idFieldsGridColumn,
//   idFieldsValidation,
//   categoryStore,
//   clientStore,
//   editMode
// }) => {
//   const [windowInfo, setWindowInfo] = useState(null)

//   return (
//     <>
//       <Window
//         id='IdTypesWindow'
//         Title={labels.IdTypes}
//         tabs={tabs}
//         activeTab={activeTab}
//         onClose={onClose}
//         width={width}
//         height={height}
//         onSave={onSave}
//         setActiveTab={setActiveTab}
//         onInfo={() => setWindowInfo(true)}
//         disabledInfo={!editMode && true}
//         onInfoClose={() => setWindowInfo(false)}

//         // categoryStore={categoryStore}
//         //clientStore={clientStore}
//         //idTypesValidation={idTypesValidation}
//       >
//         <CustomTabPanel index={0} value={activeTab}>
//           <IdTypesTab
//             labels={labels}
//             idTypesValidation={idTypesValidation}
//             categoryStore={categoryStore}
//             clientStore={clientStore}
//             maxAccess={maxAccess}
//             editMode={editMode}
//           />
//         </CustomTabPanel>

//         <CustomTabPanel index={1} value={activeTab}>
//           <IdFieldsTab
//             idFieldsValidation={idFieldsValidation}
//             idFieldsGridColumn={idFieldsGridColumn}
//             idTypesValidation={idTypesValidation}
//             maxAccess={maxAccess}
//             idtId={idtId}
//           />
//         </CustomTabPanel>
//       </Window>
//       {windowInfo && (
//         <TransactionLog
//           resourceId={ResourceIds && ResourceIds.IdTypes}
//           recordId={idTypesValidation.values.recordId}
//           onInfoClose={() => setWindowInfo(false)}
//         />
//       )}
//     </>
//   )
// }

// export default IdTypesWindow
