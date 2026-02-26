import { useContext, useEffect, useRef, useState } from 'react'
import { Button, Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { formatDate, formatDateDefault } from '@argus/shared-domain/src/lib/date-helper'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useError } from '@argus/shared-providers/src/providers/error'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from './Form'
import CustomButton from '../Inputs/CustomButton'

const formatDateForImport = dateString => {
  const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10))
  const fullYear = year < 100 ? 2000 + year : year
  const date = new Date(Date.UTC(fullYear, month - 1, day, 0, 0, 0))

  return date.toISOString().split('.')[0] + 'Z'
}

const convertValue = (value, dataType, isAPI = false) => {
  if (value === '') {
    return value
  }
  switch (dataType) {
    case 2:
      return parseInt(value, 10)
    case 3:
      return parseFloat(value)
    case 5:
      return isAPI ? formatDateForImport(value) : formatDateDefault(formatDate(value))
    default:
      return value
  }
}

const parseCSV = (text, columns, staticColumns = []) => {
  const lines = text.split('\n').filter(line => line.trim())
  if (!lines.length) return { count: 0, list: [] }

  const headers = lines[0].split(',').map(h => h.trim())

  const columnMap = columns.reduce((map, col) => {
    map[col.headerName] = col

    return map
  }, {})

  const orderedColumns = headers.map(header => columnMap[header])

  const rows = lines.slice(1).map((line, i) => {
    const values = line.split(',').map(val => val.trim())

    let row = orderedColumns.reduce(
      (acc, col, index) => {
        const header = headers[index]
        if (col) {
          acc[col.field] = convertValue(values[index], col.dataType)
        } else {
          acc[header] = values[index]
        }

        return acc
      },
      { recordId: i + 1 }
    )

    staticColumns.forEach(col => {
      if (headers.includes(col.field)) {
        row[col.field] = col.value
      } else {
        row[col.field] = col.value
      }
    })

    if (row.minPrice) row.minPrice = parseFloat(row.minPrice) || 0

    return row
  })

  return { count: rows.length, list: rows }
}

const validateMandatoryFields = (rows, columns, stackError) => {
  const mandatoryCols = columns.filter(col => col.mandatory)

  const missing = rows.flatMap(row =>
    mandatoryCols
      .filter(col => row[col.field] === null || row[col.field] === undefined || row[col.field] === '')
      .map(col => col.headerName)
  )

  const uniqueMissing = [...new Set(missing)]
  if (uniqueMissing.length) {
    stackError({
      message: `${uniqueMissing.join(', ')} ${uniqueMissing.length > 1 ? 'are' : 'is'} mandatory.`
    })

    return false
  }

  return true
}

const getImportData = (gridData, columns, stackError) => {
  const mandatoryColumns = columns.filter(col => col.mandatory)

  const missingFields = gridData.list.flatMap(row =>
    mandatoryColumns
      .filter(col => row[col.field] === null || row[col.field] === undefined || row[col.field] === '')
      .map(col => col.headerName)
  )

  if (missingFields.length > 0) {
    const uniqueMissingFields = [...new Set(missingFields)]
    stackError({
      message: `${uniqueMissingFields.join(', ')} ${uniqueMissingFields.length > 1 ? 'are' : 'is'} mandatory field${
        uniqueMissingFields.length > 1 ? 's' : ''
      }.`
    })
  }

  const convertedData = gridData.list.map(row => {
    return Object.keys(row).reduce((acc, key) => {
      const col = columns.find(c => c.field === key)
      let value = row[key]
      value = value === '' ? null : value
      acc[key] = col ? convertValue(value, col.dataType, true) : value

      return acc
    }, {})
  })

  return convertedData
}

const ImportForm = ({ staticColumns = [], onSuccess, resourceId, access, window }) => {
  const { stack: stackError } = useError()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [importConfig, setImportConfig] = useState(null)
  const [parsedFileContent, setParsedFileContent] = useState({ count: 0, list: [] })
  const [file, setFile] = useState(null)
  const imageInputRef = useRef(null)

  useSetWindow({ title: platformLabels.import, window })

  useEffect(() => {
    if (resourceId) {
      getRequest({
        extension: SystemRepository.ETL.get,
        parameters: `_resourceId=${resourceId}`
      }).then(res => {
        if (res.record) {
          setImportConfig(res)
        }
      })
    }
  }, [resourceId])

  if (!importConfig?.record) return null

  const modifiedFields =
    importConfig.record.fields?.map(({ name, dataType, format, ...rest }) => ({
      field: name,
      headerName: name,
      width: 130,
      type: (dataType === 2 && format === '1') || dataType === 3 ? 'number' : undefined,
      dataType,
      ...rest
    })) || []

  const csvFieldNames = modifiedFields.map(f => f.field)

  const columns = [
    ...staticColumns
      .filter(col => !csvFieldNames.includes(col.field))
      .map(col => ({
        field: col.field,
        headerName: col.field,
        width: 130,
        dataType: 1,
        readOnly: true
      })),
    ...modifiedFields
  ]

  const objectName = importConfig.record.objectName
  const endPoint = importConfig.record.endPoint

  const handleFileChange = event => {
    const file = event.target.files[0]
    setFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const data = parseCSV(e.target.result, columns, staticColumns)
        setParsedFileContent(data)
      }
      reader.readAsText(file)
    }
  }

  const clearFile = () => {
    setFile(null)
    setParsedFileContent({ count: 0, list: [] })
    if (imageInputRef.current) imageInputRef.current.value = null
  }

  const handleSubmit = async () => {
    const isValid = validateMandatoryFields(parsedFileContent.list, columns, stackError)
    const convertedData = getImportData(parsedFileContent, columns, stackError)
    const payload = { [objectName]: convertedData }

    if (!isValid) return

    const res = await postRequest({
      extension: endPoint,
      record: JSON.stringify(payload)
    })

    onSuccess?.(res)

    toast.success(platformLabels.Imported)
    if (window) window.close()
  }

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: handleSubmit,
      disabled: !file?.name
    }
  ]

  return (
    <Form
      onSave={handleSubmit}
      disabledSubmit={!file?.name}
      isSaved={false}
      actions={actions}
      maxAccess={access}
      isParentWindow={false}
    >
      <VertLayout>
        <Fixed>
          <GridToolbar
            leftSection={
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Grid item sx={{ display: 'flex', mr: 2 }}>
                    <CustomTextField
                      name='name'
                      label={platformLabels?.SelectCSV}
                      value={file?.name}
                      readOnly
                      disabled={!!file?.name}
                    />

                    <CustomButton
                      label={`${platformLabels?.Browse}...`}
                      disabled={!!file?.name}
                      onClick={() => imageInputRef.current.click()}
                      style={{
                        marginLeft: 2,
                      }}
                    />

                    <input
                      type='file'
                      accept='.csv'
                      ref={imageInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    <CustomButton
                      image='clear.png'
                      tooltipText={platformLabels?.Clear}
                      onClick={clearFile}
                      style={{
                        marginLeft: 2,
                        backgroundColor: '#f44336',
                        padding: 0
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
        </Fixed>

        <Grow>
          <Table
            name='import'
            columns={[
              {
                field: 'recordId',
                headerName: '',
                width: 130
              },
              ...columns
            ]}
            gridData={parsedFileContent}
            rowId={['recordId']}
            isLoading={false}
            pageSize={50}
            paginationType='api'
            pagination={false}
            maxAccess={access}
            textTransform
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

ImportForm.width = 1000
ImportForm.height = 600

export default ImportForm
