import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { AdministrationRepository } from '@argus/repositories/src/repositories/AdministrationRepository'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import TemplateBodyForm from './TemplateBodyForm'

export default function TemplateForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: AdministrationRepository.AdTemplate.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: ''
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: AdministrationRepository.AdTemplate.set,
        record: JSON.stringify(obj)
      })
      formik.setFieldValue('recordId', res.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: AdministrationRepository.AdTemplate.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    return await getRequest({
      extension: AdministrationRepository.TemplateBody.qry,
      parameters: `_teId=${recordId}`
    })
  }

  const editMode = !!formik.values.recordId

  const {
    query: { data },
    invalidate: invalidateBody,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AdministrationRepository.TemplateBody.qry,
    datasetId: ResourceIds.Template
  })

  const columns = [
    {
      field: 'languageName',
      headerName: labels.language,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: AdministrationRepository.TemplateBody.del,
      record: JSON.stringify(obj)
    })
    invalidateBody()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId, languageId) {
    stack({
      Component: TemplateBodyForm,
      props: {
        labels,
        recordId,
        languageId,
        maxAccess
      },
      width: 900,
      height: 700,
      title: labels?.TemplateBody
    })
  }

  const add = () => {
    openForm(recordId)
  }

  const edit = obj => {
    openForm(obj?.teId, obj?.languageId)
  }

  return (
    <FormShell
      resourceId={ResourceIds.Template}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isParentWindow={false}
    >
      <VertLayout>
        <Fixed>
          <Grid item sx={{ paddingTop: 2 }}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik.values?.name}
              required
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('name', '')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              maxLength={30}
            />
          </Grid>
          <GridToolbar onAdd={add} maxAccess={maxAccess} disableAdd={!editMode} />
        </Fixed>
        <Grow>
          <Table
            name='templateBodyTable'
            columns={columns}
            gridData={data}
            rowId={['recordId']}
            onEdit={edit}
            onDelete={del}
            pagination={false}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}