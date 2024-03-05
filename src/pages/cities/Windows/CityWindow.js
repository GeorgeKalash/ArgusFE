// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CityForm from 'src/pages/cities/Forms/CityForm'
import { useState } from 'react'



const CityWindow = ({
    onClose,
    labels,
    maxAccess,
    recordId
}) => {

    return (
        <>
        <Window
        id='CityWindow'
        Title={labels.cities}
        controlled={true}
        onClose={onClose}
        width={600}
        height={400}
        >
            <CityForm
                labels={labels}
                maxAccess={maxAccess}
                recordId={recordId}                
            />
        </Window>
    </>
  )
}

export default CityWindow