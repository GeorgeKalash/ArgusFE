import { useContext, useEffect, useRef, useState } from 'react'
import { Button, Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import GridToolbar from 'src/components/Shared/GridToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { formatDate, formatDateDefault } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useError } from 'src/error'

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
      return parseInt(value, 10) || 0
    case 3:
      return parseFloat(value) || 0
    case 5:
      return isAPI ? formatDateForImport(value) : formatDateDefault(formatDate(value))
    default:
      return value
  }
}

const parseCSV = (text, columns) => {
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

    return orderedColumns.reduce(
      (row, col, index) => {
        const header = headers[index]
        if (col) {
          row[col.field] = convertValue(values[index], col.dataType)
        } else {
          row[header] = values[index]
        }

        return {
          ...row,
          minPrice: row.minPrice ? parseFloat(row.minPrice) : 0
        }
      },
      { recordId: i + 1 }
    )
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

const ImportForm = ({ onSuccess, resourceId, access, platformLabels, window }) => {
  const { stack: stackError } = useError()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [importConfig, setImportConfig] = useState(null)
  const [parsedFileContent, setParsedFileContent] = useState({ count: 0, list: [] })
  const [file, setFile] = useState(null)
  const imageInputRef = useRef(null)

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
      flex: 1,
      type: (dataType === 2 && format === '1') || dataType === 3 ? 'number' : undefined,
      dataType,
      ...rest
    })) || []

  const columns = modifiedFields || []
  const objectName = importConfig.record.objectName
  const endPoint = importConfig.record.endPoint

  const handleFileChange = event => {
    const file = event.target.files[0]
    setFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const data = parseCSV(e.target.result, columns)
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
    window.close()
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
    <VertLayout>
      <Fixed>
        <GridToolbar
          leftSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <CustomTextField
                name='name'
                label={platformLabels?.SelectCSV}
                value={file?.name}
                readOnly
                disabled={!!file?.name}
              />
              <Button
                sx={{ ml: 6, minWidth: '90px !important' }}
                variant='contained'
                size='small'
                disabled={!!file?.name}
                onClick={() => imageInputRef.current.click()}
              >
                {platformLabels?.Browse}...
              </Button>
              <input
                type='file'
                accept='.csv'
                ref={imageInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                onClick={clearFile}
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': { backgroundColor: '#f44336', opacity: 0.8 },
                  ml: 2
                }}
                variant='contained'
              >
                <img src='/images/buttonsIcons/clear.png' alt={platformLabels?.Clear} />
              </Button>
            </Grid>
          }
        />
      </Fixed>

      <Grow>
        <Table
          columns={[{ field: 'recordId', headerName: '' }, ...columns]}
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

      <Fixed>
        <WindowToolbar smallBox actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default ImportForm
