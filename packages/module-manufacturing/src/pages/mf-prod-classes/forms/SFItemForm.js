import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import InlineEditGrid from '@argus/shared-ui/src/components/Shared/InlineEditGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const SFItemForm = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [itemStore, setItemStore] = useState([])

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClassSemiFinished.qry
  })

  const formik = useFormik({
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          sfItemId: yup.string().required()
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

      const response = await postRequest({
        extension: ManufacturingRepository.ProductionClassSemiFinished.set2,
        record: JSON.stringify(resultObject)
      })

      !recordId &&
        setInitialData({
          ...obj,
          recordId: response.recordId
        })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
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
      }).then(res => {
        setItemStore(res.list)
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
      if (recordId) {
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
