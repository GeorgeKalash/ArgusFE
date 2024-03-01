// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CountryForm from 'src/pages/countries/forms/CountryForm'


const CountryWindow = ({
    onClose,
    _labels,
    maxAccess,
    recordId
}) => {

    return (
        <>
        <Window id='CountryWindow' Title={_labels.country} controlled={true} onClose={onClose} width={600} height={400} >
            <CountryForm
                _labels={_labels}
                maxAccess={maxAccess}
                recordId={recordId}
            />
        </Window>
    </>
  )
}

export default CountryWindow
