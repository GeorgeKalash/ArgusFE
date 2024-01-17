// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CityTab from 'src/pages/cities/Tabs/CityTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'



const CityWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    stateStore,
    countryStore,
    cityValidation,
    fillStateStore,
    labels,
    maxAccess
}) => {
    const [windowInfo, setWindowInfo] = useState(null)

    return (
        <>
        <Window
        id='CityWindow'
        Title={labels.cities}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        cityValidation={cityValidation}
        countryStore={countryStore}
        stateStore={stateStore}
        onInfo={() => setWindowInfo(true)}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
        >
            <CustomTabPanel>
               <CityTab
                  labels={labels}
                  cityValidation={cityValidation}
                  countryStore={countryStore}
                  stateStore={stateStore}
                  editMode={editMode}
                  fillStateStore={fillStateStore}
                  maxAccess={maxAccess}
                  
               />
            </CustomTabPanel>
            </Window>
        {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.Cities}
          recordId={cityValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default CityWindow