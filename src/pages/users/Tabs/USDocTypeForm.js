import { Grid } from '@mui/material'
import Table from 'src/components/Shared/Table'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const USDocTypeForm = ({ labels, maxAccess, storeRecordId, functionId, invalidate, window }) => {
  const editMode = !!storeRecordId
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      userId: storeRecordId || null,
      functionId: functionId || null,
      dtId: null
    },
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: SystemRepository.UserFunction.set,
          record: JSON.stringify({ userId: obj.userId, functionId: obj.functionId, dtId: obj.dtId || null })
        })
        data.list.map(async obj => {
          if (obj.checked) {
            await postRequest({
              extension: AccessControlRepository.RowAccessUserView.set,
              record: JSON.stringify({
                userId: storeRecordId,
                resourceId: ResourceIds.DocumentTypes,
                recordId: obj.recordId
              })
            })
          } else {
            await postRequest({
              extension: AccessControlRepository.RowAccessUserView.del,
              record: JSON.stringify({
                userId: storeRecordId,
                resourceId: ResourceIds.DocumentTypes,
                recordId: obj.recordId
              })
            })
          }
        })
        toast.success(platformLabels.Updated)
        window.close()
        invalidate()
      } catch (error) {}
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 2
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 2
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        const documentTypesPromise = getRequest({
          extension: SystemRepository.DocumentType.qry,
          parameters: `_dgId=${functionId}&_startAt=${0}&_pageSize=${1000}`
        })

        const rowAccessUserPromise = getRequest({
          extension: AccessControlRepository.RowAccessUserView.qry,
          parameters: `_resourceId=${ResourceIds.DocumentTypes}&_userId=${storeRecordId}`
        })

        Promise.all([documentTypesPromise, rowAccessUserPromise]).then(([docTypes, rowAccess]) => {
          const checkedDocTypes = docTypes.list.map(docTypeItem => {
            const item = {
              recordId: docTypeItem.recordId,
              reference: docTypeItem.reference,
              name: docTypeItem.name,
              checked: false
            }
            const matchingDocType = rowAccess.list.find(y => item.recordId == y.recordId)

            matchingDocType && (item.checked = true)

            return item
          })
          setData({ list: checkedDocTypes })
        })

        const res = await getRequest({
          extension: SystemRepository.UserFunction.get,
          parameters: `_userId=${storeRecordId}&_functionId=${functionId}`
        })
        formik.setValues(res.record)
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Users}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!storeRecordId}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
              parameters={`_dgId=${functionId}&_startAt=${0}&_pageSize=${50}`}
              filter={!editMode ? item => item.activeStatus === 1 : undefined}
              name='dtId'
              label={labels.docType}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={async (event, newValue) => {
                formik.setFieldValue('dtId', newValue?.recordId)
              }}
              error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              maxAccess={maxAccess}
            />
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={columns}
            gridData={data ? data : { list: [] }}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default USDocTypeForm
