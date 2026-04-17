import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect, useState } from 'react'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SecurityGrpTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const initialGroups = [
    {
      id: 1,
      sgId: '',
      sgName: '',
      userId: storeRecordId
    }
  ]

  const [fullGroups, setFullGroups] = useState(initialGroups)

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      groups: initialGroups
    },
    onSubmit: async values => {
      await postGroups(values)
    }
  })

  const postGroups = async () => {
    const groups = fullGroups
      .filter(item => item.sgId)
      .map(item => ({
        sgId: item.sgId,
        userId: storeRecordId
      }))

    const data = {
      userId: storeRecordId,
      sgId: 0,
      groups
    }

    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }


  async function fetchGridData() {
    const res = await getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: `_userId=${storeRecordId}&_filter=&_sgId=0`
    })

    const items = res.list.map((item, index) => ({
      ...item,
      id: index + 1
    }))

    setFullGroups(items)
  }

  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        await fetchGridData()
      }
    })()
  }, [storeRecordId])

  function handleRowsChange(updatedFilteredRows) {
    setFullGroups(updatedFilteredRows)
    return
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!storeRecordId}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={handleRowsChange}
            value={fullGroups}
            enableFilters
            initialValues={formik?.initialValues?.groups?.[0]}
            columns={[
              {
                component: 'resourcecombobox',
                name: 'sgName',
                label: labels.group,
                props: {
                  endpointId: AccessControlRepository.SecurityGroup.qry,
                  parameters: '_startAt=0&_pageSize=1000',
                  valueField: 'recordId',
                  displayField: 'name',
                  mapping: [
                    { from: 'recordId', to: 'sgId' },
                    { from: 'name', to: 'sgName' }
                  ]
                }
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SecurityGrpTab
