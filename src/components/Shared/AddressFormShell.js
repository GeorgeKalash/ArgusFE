import React, {useState, useEffect} from 'react'
import FormShell from './FormShell'
import AddressTab from './AddressTab'
import { useFormik } from 'formik'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'

export const AddressFormShell = ({setAddress , address , maxAccess , editMode , window, readOnly , allowPost, setPost}) => {
  const [requiredOptional, setRequiredOptional] = useState(true)


  const {
    labels: labels,
    access
  } = useResourceParams({
    datasetId: ResourceIds.ClientMaster
  })

  const [initialValues, setInitialData] = useState({
    name: address?.name,
    countryId: address?.countryId || 0,
    stateId: address?.stateId || 0,
    cityId: address?.cityId,
    city: address?.city,
    street1: address?.street1,
    street2: address?.street2,
    email1: address?.email1,
    email2: address?.email2,
    phone: address?.phone,
    phone2: address?.phone2,
    phone3: address?.phone3,
    addressId: address?.addressId,
    postalCode:address?.postalCode,
    cityDistrictId: address?.cityDistrictId,
    cityDistrict: address?.cityDistrict,
    bldgNo: address?.bldgNo,
    unitNo: address?.unitNo,
    subNo: address?.subNo
  });

  useEffect(()=>{
    setInitialData(address)
  },[address])

  const WorkAddressFormik = useFormik({

    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur:true,
    validate : (values) => {
      const errors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (values.name || values.cityId || values.phone || values.countryId ||  values.street1)  {
        if (!values.name ) {
          errors.name = 'This field is required';
        }
        if (!values.street1 ) {
          errors.street1 = 'This field is required';
        }
        if (!values.countryId ) {
          errors.countryId = 'This field is required';
        }
        if (!values.cityId ) {
          errors.cityId = 'This field is required';
        }
        if (!values.cityId ) {
          errors.phone = 'This field is required';
        }

      }
      if (values.email1  && !emailRegex?.test(values?.email1) ) {
        errors.email1 = 'Invalid email format';
      }

      if (values.email2 && !emailRegex?.test(values?.email2) ) {
        errors.email2 = 'Invalid email format';
      }


      return errors;


    },
    initialValues,

    onSubmit: values => {

        setAddress(values)
      if(allowPost){
          setPost(values)
      }else{
          window.close()

      }
    }
  })

  useEffect(()=>{
    if((WorkAddressFormik.values.name || WorkAddressFormik.values.street1 || WorkAddressFormik.values.phone || WorkAddressFormik.values.countryId ||  WorkAddressFormik.values.cityId) && requiredOptional){
      setRequiredOptional(false)
     }

     if((!WorkAddressFormik.values.name && !WorkAddressFormik.values.street1 && !WorkAddressFormik.values.phone && !WorkAddressFormik.values.countryId &&  !WorkAddressFormik.values.cityId)){
      setRequiredOptional(true)
     }
  }, [WorkAddressFormik.values])

return (
    <FormShell  form={WorkAddressFormik} maxAccess={maxAccess}  infoVisible={false} readOnly={readOnly} editMode={editMode}>
      <AddressTab  addressValidation={WorkAddressFormik} maxAccess={maxAccess} labels={labels} requiredOptional={requiredOptional}  readOnly={readOnly} />
    </FormShell>
  )
}
