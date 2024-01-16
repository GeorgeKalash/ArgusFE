// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import CityDistrictTab from 'src/pages/city-districts/Tabs/CityDistrictTab'

import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const CityDistrictWindow = ({
    onClose,
    onSave,
    cityDistrictValidation,
    countryStore,
    cityStore,
    setCityStore,
    lookupCity,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    const [windowInfo, setWindowInfo] = useState(null)

    return (
        <>
        <Window id='CityDistrictWindow' Title={_labels.cityDistrict} onClose={onClose} width={width} height={height} 
         onSave={onSave}
         onInfo={() => setWindowInfo(true)}
         disabledInfo={!editMode && true}
         onInfoClose={() => setWindowInfo(false)}>
            <CustomTabPanel>
                <CityDistrictTab
                    cityDistrictValidation={cityDistrictValidation}
                    countryStore={countryStore}
                    cityStore={cityStore}
                    setCityStore={setCityStore}
                    lookupCity={lookupCity}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
            </Window>
        {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.CityDistrict}
          recordId={cityDistrictValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default CityDistrictWindow
