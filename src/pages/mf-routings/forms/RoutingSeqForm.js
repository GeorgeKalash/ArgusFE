import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const RoutingSeqForm = ({ labels, maxAccess, recordId, setErrorMessage, setSelectedRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [workCenterStore, setWorkCenterStore] = useState([])
  const [operationStore, setOperationStore] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Routing.qry
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          seqNo: yup.string().required('Semi finished item is required'),
          name: yup.string().required('Semi finished item is required'),
          workCenterName: yup.string().required('Semi finished item is required'),
          operationName: yup.string().required('Semi finished item is required')
        })
      )
    }),
    initialValues: {
      rows: [
        {
          routingId: recordId || '',
          seqNo: '',
          name: '',
          workCenterId: '',
          operationId: '',
          workCenterName: '',
          workCenterRef: '',
          operationName: ''
        }
      ]
    },
    onSubmit: async obj => {
      const resultObject = {
        routingId: recordId,
        data: formik.values.rows
      }

      console.log('rows ', resultObject)

      const response = await postRequest({
        extension: ManufacturingRepository.RoutingSequence.set2,
        record: JSON.stringify(resultObject)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')

      invalidate()
    }
  })

  useEffect(() => {
    FillWorkCenter()
  }, [])

  useEffect(() => {
    FillOperation()
  }, [])

  const FillWorkCenter = () => {
    const defaultParams = `_filter=`
    var parameters = defaultParams

    getRequest({
      extension: ManufacturingRepository.WorkCenter.qry,
      parameters: parameters
    })
      .then(res => {
        setWorkCenterStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const FillOperation = () => {
    const defaultParams = `_filter=`
    var parameters = defaultParams + '&_workCenterId=0'

    getRequest({
      extension: ManufacturingRepository.Operation.qry,
      parameters: parameters
    })
      .then(res => {
        setOperationStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const columns = [
    {
      field: 'numberfield',
      header: labels.seqNo,
      name: 'seqNo',
      mandatory: false,
      hidden: false,
      readOnly: false
    },
    {
      field: 'textfield',
      header: labels.name,
      name: 'name',
      mandatory: true,
      readOnly: false
    },
    {
      field: 'combobox',
      header: labels.workCenter,
      nameId: 'workCenterId',
      name: 'workCenterRef',
      mandatory: true,
      store: workCenterStore,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: 200,

      fieldsToUpdate: [{ from: 'name', to: 'workCenterName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'combobox',
      header: labels.operation,
      nameId: 'operationId',
      name: 'operationName',
      mandatory: true,
      store: operationStore,
      valueField: 'recordId',
      displayField: 'name',
      widthDropDown: 200,

      fieldsToUpdate: [{ from: 'name', to: 'operationName' }],
      columnsInDropDown: [{ key: 'name', value: 'Name' }]
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: ManufacturingRepository.RoutingSequence.qry,
            parameters: `_routingId=${recordId}`
          })

          if (res.list.length > 0) {
            formik.setValues({ rows: res.list })
          } else {
            formik.setValues({
              rows: [
                {
                  routingId: recordId || '',
                  seqNo: '',
                  name: '',
                  workCenterId: '',
                  operationId: '',
                  workCenterName: '',
                  workCenterRef: '',
                  operationName: ''
                }
              ]
            })
          }
        }
      } catch (error) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <FormShell resourceId={ResourceIds.Routings} form={formik} height={300} editMode={true} maxAccess={maxAccess}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: -5 }}>
          <InlineEditGrid
            gridValidation={formik}
            maxAccess={maxAccess}
            columns={columns}
            defaultRow={{
              routingId: recordId || '',
              seqNo: '',
              name: '',
              workCenterId: '',
              operationId: '',
              workCenterName: '',
              workCenterRef: '',
              operationName: ''
            }}
            width={500}
          />
        </Box>
      </FormShell>
    </>
  )
}

export default RoutingSeqForm
