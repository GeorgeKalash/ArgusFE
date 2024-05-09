// ** Custom Imports
import Window from 'src/components/Shared/Window'

// **Tabs
import CityDistrictForm from 'src/pages/city-districts/Forms/CityDistrictForm'


const CityDistrictWindow = ({
  onClose,
  _labels,
  maxAccess,
  recordId
}) => {
    return (
        <>
        <Window id='CityDistrictWindow' Title={_labels.cityDistrict} controlled={true} onClose={onClose} width={600}
        height={400} >
                <CityDistrictForm
                    _labels={_labels}
                    maxAccess={maxAccess}
                    recordId={recordId}  
                />
            </Window>
    </>
  )
}

export default CityDistrictWindow
