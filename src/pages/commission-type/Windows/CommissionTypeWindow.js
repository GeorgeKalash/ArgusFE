// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CommissionTypeTab from 'src/pages/commission-type/Tabs/CommissionTypeTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const CommissionTypeWindow = ({
  onClose,
  width,
  height,
  onSave,
  editMode,
  typeStore,
  commissiontypeValidation,
  labels,
  maxAccess
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
      <Window
        id='CommissionTypeWindow'
        Title={labels.comissiontype}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        commissiontypeValidation={commissiontypeValidation}
        typeStore={typeStore}
        onInfo={() => setWindowInfo(true)}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
      >
        <CustomTabPanel>
          <CommissionTypeTab
            labels={labels}
            commissiontypeValidation={commissiontypeValidation}
            typeStore={typeStore}
            editMode={editMode}
            maxAccess={maxAccess}
          />
        </CustomTabPanel>
      </Window>
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.CommissionType}
          recordId={commissiontypeValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default CommissionTypeWindow
