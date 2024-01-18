// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import IDNumberTab from 'src/pages/bp-master-data/Tabs/IDNumberTab'
import RelationTab from 'src/pages/bp-master-data/Tabs/RelationTab'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import FormShell from 'src/components/Shared/FormShell'
import BPMasterDataForm from '../forms/BPMasterDataForm'
import { useState } from 'react'

const BPMasterDataWindow = ({
  onClose,
  labels,
  maxAccess,
  idNumberValidation,
  idNumberGridColumn,
  relationGridData,
  getRelationGridData,
  addRelation,
  delRelation,
  defaultValue,
  popupRelation,

  //Address tab (grid)
  addressGridData,
  getAddressGridData,
  addAddress,
  delAddress,
  editAddress,
  recordId
}) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  return (
    <>
      <Window
        id='BPMasterDataWindow'
        Title={labels.masterData}
        tabs={[
          { label: labels.general },
          { label: labels.idNumber, disabled: !editMode },
          { label: labels.relation, disabled: !editMode },
          { label: labels.address, disabled: !editMode }
        ]}
        controlled={true}
        activeTab={activeTab}
        onClose={onClose}
        width={800}
        height={400}
        setActiveTab={setActiveTab}
      >
        <CustomTabPanel index={0} value={activeTab}>
          <BPMasterDataForm labels={labels} maxAccess={maxAccess} defaultValue={defaultValue} recordId={recordId} />
        </CustomTabPanel>

        <CustomTabPanel index={1} value={activeTab}>
          <FormShell form={idNumberValidation}>
            <IDNumberTab
              recordId={recordId}
              idNumberValidation={idNumberValidation}
              idNumberGridColumn={idNumberGridColumn}
              maxAccess={maxAccess}
            />
          </FormShell>
        </CustomTabPanel>
        <CustomTabPanel index={2} value={activeTab}>
          <RelationTab
            relationGridData={relationGridData}
            getRelationGridData={getRelationGridData}
            addRelation={addRelation}
            delRelation={delRelation}
            popupRelation={popupRelation}
            labels={labels}
            maxAccess={maxAccess}
          />
        </CustomTabPanel>
        <CustomTabPanel index={3} value={activeTab}>
          <AddressGridTab
            addressGridData={addressGridData}
            getAddressGridData={getAddressGridData}
            addAddress={addAddress}
            delAddress={delAddress}
            editAddress={editAddress}
            labels={labels}
            maxAccess={maxAccess}
          />
        </CustomTabPanel>
      </Window>
    </>
  )
}

export default BPMasterDataWindow
