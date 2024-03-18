import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

const CorrespondentCountriesForm = ({
  store,
  setStore,
  maxAccess,
  labels,
  expanded,
  editMode
}) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

    const formik = useFormik({
      enableReinitialize: true,
      validateOnChange: true,

      validationSchema: yup.object({ countries: yup
        .array()
        .of(
          yup.object().shape({
            country: yup
              .object()
              .shape({
                recordId: yup.string().required('Country recordId is required')
              })
              .required('Country is required'),
          })
        ).required('Operations array is required') }),

      initialValues: {
        countries: [
          {
            id: 1,
            corId: recordId || null,
            country: '',
            countryId: '',
            countryRef: '',
            countryName: '',
            flName: ''
          }
        ]
      },
      onSubmit: values => {
        postCorrespondentCountries(values)
      }
    })

 const postCorrespondentCountries = obj => {

    const correspondentCountries= obj?.countries

    const data = {
      corId: recordId,
       correspondentCountries
    }

    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentCountry.set2,
      record: JSON.stringify(data)
    })
      .then(res => {

        setStore(prevStore => ({
          ...prevStore,
            countries: correspondentCountries
        }));
          toast.success('Record Edited Successfully')
      })
      .catch(error => {

      })
  }

  useEffect(()=>{
      const defaultParams = `_corId=${recordId}`
      var parameters = defaultParams
      recordId &&   getRequest({
        extension: RemittanceSettingsRepository.CorrespondentCountry.qry,
        parameters: parameters
      })
        .then(res => {
          if (res?.list?.length > 0) {
            const correspondentCountries = res.list

            formik.setValues({ countries: correspondentCountries.map(
              ({ countryId,  countryRef, countryName, ...rest } , index) => ({
                 id : index,
                 country : { recordId: countryId,
                 name: countryName,
                 reference: countryRef
                },
                countryName: countryName,
                countryId,
                 ...rest


              }) )})
              setStore(prevStore => ({
                ...prevStore,
                  countries: correspondentCountries
              }));
          } else {
            formik.setValues({
              countries: [
                { id: 1,
                  corId: '',
                  countryId: '',
                  countryRef: '',
                  countryName: '',
                  flName: ''
                }
              ]
            })
          }
        })
        .catch(error => {
        })


  },[recordId])

return (
    <>
        <FormShell
          form={formik}
          resourceId={ResourceIds.Correspondent}
          maxAccess={maxAccess}
          editMode={editMode} >
          <DataGrid
            onChange={value => formik.setFieldValue('countries', value)}
            value={formik.values.countries}
            error={formik.errors.countries}
            columns={[
              {
                component: 'resourcecombobox',
                name: 'country',
                label: labels.country,
                 props: {
                  endpointId: SystemRepository.Country.qry,
                  valueField: 'recordId',
                  displayField: 'reference',
                  fieldsToUpdate: [ { from: 'name', to: 'countryName' } ],
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                  ]
                },
                async onChange({ row: { update, newRow } }) {

                  console.log(newRow)
                  if(!newRow?.country?.recordId){
                  return;
                  }else{
                       update({'countryName':newRow.country?.name,
                               'countryRef': newRow.country?.reference,
                               'countryId': newRow.country?.recordId })

                  }



                }
              },
              {
                component: 'textfield',
                label: labels?.name,
                name: 'countryName',
                props:{readOnly: true}
              },
            ]}

            height={`${expanded ? height-300 : 350}px`}


        />
      </FormShell>
    </>
  )
}

export default CorrespondentCountriesForm
