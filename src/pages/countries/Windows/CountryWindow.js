// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import CountryTab from 'src/pages/countries/Tabs/countryTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'


const CountryWindow = ({
    onClose,
    onSave,
    countryValidation,
    currencyStore,
    regionStore,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    const [windowInfo, setWindowInfo] = useState(null)

    return (
        <>
        <Window id='CountryWindow' Title={_labels.country} onClose={onClose} width={width} height={height} 
         onSave={onSave}
         onInfo={() => setWindowInfo(true)}
         disabledInfo={!editMode && true}
         onInfoClose={() => setWindowInfo(false)}>
            <CustomTabPanel>
                <CountryTab
                    countryValidation={countryValidation}
                    currencyStore={currencyStore}
                    regionStore={regionStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
        {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.Countries}
          recordId={countryValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default CountryWindow
