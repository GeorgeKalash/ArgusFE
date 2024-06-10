import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const SFItemForm = ({ labels, maxAccess, recordId, setErrorMessage, setSelectedRecordIds }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [itemStore, setItemStore] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClassSemiFinished.qry
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          sfItemId: yup.string().required('Semi finished item is required')
        })
      )
    }),
    initialValues: {
      rows: [
        {
          classId: recordId || '',
          sfItemId: null,
          itemName: '',
          sku: ''
        }
      ]
    },
    onSubmit: async obj => {
      const resultObject = {
        classId: recordId,
        items: formik.values.rows
      }

      console.log('rows ', resultObject)

      const response = await postRequest({
        extension: ManufacturingRepository.ProductionClassSemiFinished.set2, //ProductionClassSemiFinishedPack
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

  const lookupItem = inp => {
    const input = inp

    if (input) {
      var parameters = `_size=30&_startAt=0&_filter=${input}&_categoryId=0&_msId=0`

      getRequest({
        extension: InventoryRepository.Item.snapshot,
        parameters: parameters
      })
        .then(res => {
          setItemStore(res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const columns = [
    {
      field: 'lookup',
      header: labels.semiFinishedItemRef,
      nameId: 'sfItemId',
      name: 'sku',
      mandatory: true,
      store: itemStore,
      valueField: 'recordId',
      displayField: 'sku',
      widthDropDown: 200,
      fieldsToUpdate: [{ from: 'name', to: 'itemName' }],
      columnsInDropDown: [
        { key: 'sku', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ],
      onLookup: lookupItem
    },
    {
      field: 'textfield',
      header: labels.semiFinishedItemName,
      name: 'itemName',
      mandatory: true,
      readOnly: true
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: ManufacturingRepository.ProductionClassSemiFinished.qry,
            parameters: `_classId=${recordId}`
          })

          if (res.list.length > 0) {
            formik.setValues({ rows: res.list })
          } else {
            formik.setValues({
              rows: [
                {
                  classId: recordId || '',
                  sfItemId: null,
                  itemName: '',
                  sku: ''
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
    <FormShell resourceId={ResourceIds.ProductionClass} form={formik} editMode={true} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: -5 }}>
            <InlineEditGrid
              gridValidation={formik}
              maxAccess={maxAccess}
              columns={columns}
              defaultRow={{
                classId: recordId || '',
                sfItemId: null,
                itemName: '',
                sku: ''
              }}
              width={500}
            />
          </Box>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SFItemForm
