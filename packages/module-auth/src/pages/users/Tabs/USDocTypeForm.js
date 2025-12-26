import { Grid } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const USDocTypeForm = ({ labels, maxAccess, storeRecordId, functionId, invalidate, window }) => {
  const editMode = !!storeRecordId
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
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

        const accessPayload = {
          userId: storeRecordId,
          functionId: obj.functionId,
          items: data.list.map(item => ({
            userId: storeRecordId,
            dtId: item.recordId,
            functionId: obj.functionId,
            isChecked: item.checked
          }))
        }

        await postRequest({
          extension: SystemRepository.UserFunction.set2,
          record: JSON.stringify(accessPayload)
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
      flex: 1
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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!storeRecordId}>
      <VertLayout>
        <Fixed>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={SystemRepository.DocumentType.qry}
              parameters={`_dgId=${functionId}&_startAt=0&_pageSize=1000`}
              filter={!editMode ? item => item.activeStatus === 1 : undefined}
              name='dtId'
              label={labels.docType}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
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
    </Form>
  )
}

export default USDocTypeForm
