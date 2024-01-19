// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import RelationTypeTab from 'src/pages/relation-types/Tabs/RelationTypeTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const RelationTypeWindow = ({
  onClose,
  width,
  height,
  onSave,
  editMode,
  relationTypesValidation,
  labels,
  maxAccess
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
      <Window
        id='RelationWindow'
        Title={labels.relationtype}
        onClose={onClose}
        onSave={onSave}
        width={width}
        height={height}
        onInfo={() => setWindowInfo(true)}
        relationTypesValidation={relationTypesValidation}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
      >
        <CustomTabPanel>
          <RelationTypeTab labels={labels} relationTypesValidation={relationTypesValidation} maxAccess={maxAccess} />
        </CustomTabPanel>
      </Window>
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.RelationType}
          recordId={relationTypesValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default RelationTypeWindow
