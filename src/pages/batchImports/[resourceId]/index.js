import { useRouter } from 'next/router'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Box, Button } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import toast from 'react-hot-toast'
import { formatDateDefault } from 'src/lib/date-helper'
import { ProgressForm } from 'src/components/Shared/Progress'
import { useWindow } from 'src/windows'
import { useError } from 'src/error'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const BatchImports = () => {
    const { stack } = useWindow()
    const { stack: stackError } = useError()
    const router = useRouter()

    const [columns, setColumns] = useState([])

    const [state, setState] = useState({
      gridData: [],
      name: '',
      objectName: '',
      endPoint: ''
    })

    const { getRequest, postRequest } = useContext(RequestsContext)
    const { resourceId } = router.query
    const { platformLabels } = useContext(ControlContext)

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const timestamp = date.getTime();

      return `/Date(${timestamp})/`;
    };

    const formatDateForImport = (dateString) => {
      const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
      const fullYear = year < 100 ? 2000 + year : year;
      const date = new Date(Date.UTC(fullYear, month - 1, day, 0, 0, 0));

      return date.toISOString().split('.')[0] + 'Z';
    }

    const {
      access,
      invalidate
    } = useResourceQuery({
      datasetId: resourceId
    })

    useEffect(() => {
        ;(async function () {
          try {
            if (resourceId) {
              const res = await getRequest({
                extension: SystemRepository.ETL.get,
                parameters: `_resourceId=${resourceId}`
              })

              const modifiedFields = res.record.fields.map(({ name, ...rest }, index) => ({
                field: name,
                headerName: name,
                flex: 1,
                ...rest,
              }))

              setColumns([
                { field: 'recordId', headerName: '', flex: .4 },
                ...modifiedFields
              ])
                    
              setState(prevState => ({
                ...prevState,
                objectName: res.record.objectName,
                endPoint: res.record.endPoint
              }));
            }
          } catch (exception) {}
        })()
      }, [resourceId])
      
      const handleFileChange = (event) => {
        const file = event.target.files[0]

        setState(prevState => ({
          ...prevState,
          name: file.name
        }));

        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const text = e.target.result
            parseCSV(text)
          }
          reader.readAsText(file)
        }
      }

      const transform = (array) => {
        return {
            count: array?.length > 0 ? array.length : 0,
            list: array?.length > 0 ? array.map((item, index) => ({
                ...item,
                recordId: index + 1,
                minPrice: item.minPrice || 0,
                maxAccess: item.mandatory
            })) : [],
            statusId: 1,
            message: "",
            _startAt: 0
        };
    }

    const convertValue = (value, dataType, isAPI = false) => {
      if (value === '') {
        return value;
      }
      switch (dataType) {
          case 2: 
            return parseInt(value, 10);
          case 3:
            return parseFloat(value);
          case 5:
            return isAPI 
              ? formatDateForImport(value) 
              : formatDateDefault(formatDate(value)); 
          default:
              return value;
      }
    }
    
    const parseCSV = (text) => {
      const lines = text.split('\n').filter(line => line.trim() !== '');

      if (lines.length === 0) {
        return;
      }
      
      const headers = lines[0].split(',').map(header => header.trim());
  
      const columnMap = columns.reduce((map, col) => {
        map[col.headerName] = col;

        return map;
      }, {})
  
      const orderedColumns = headers.map(header => columnMap[header]);

      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());

        return orderedColumns.reduce((obj, col, index) => {
          if (col) {
            obj[col.field] = convertValue(values[index], col.dataType);
          } else {
            obj[headers[index]] = values[index];
          }

          return obj
        }, {})
      })

      const dataFromCSV = transform(rows);
      setState(prevState => ({
        ...prevState,
        gridData: dataFromCSV
      }));
      refetch();
    }

    const clearFile = () => {
      setState(prevState => ({
        ...prevState,
        name: '',
        gridData: []
      }));
      document.getElementById('csvInput').value = null;
      refetch();
    };

    const refetch = () => {
        setState(prevState => {
            const transformedData = transform(prevState.gridData.list);

            return {
                ...prevState,
                gridData: transformedData
            };
        });
    };

    const getImportData = async () => {
      const mandatoryColumns = columns.filter(col => col.mandatory);

      const missingFields = state.gridData.list.flatMap(row =>
        mandatoryColumns
          .filter(col => row[col.field] === null || row[col.field] === undefined || row[col.field] === '')
          .map(col => col.headerName)
      );
      
      if (missingFields.length > 0) {
        const uniqueMissingFields = [...new Set(missingFields)];
        stackError({
          message: `${uniqueMissingFields.join(', ')} ${uniqueMissingFields.length > 1 ? 'are' : 'is'} mandatory field${uniqueMissingFields.length > 1 ? 's' : ''}.`
        });

        return;
      }
    
      const convertedData = state.gridData.list.map(row => {
        return Object.keys(row).reduce((acc, key) => {
          const col = columns.find(c => c.field === key);
          let value = row[key];
    
          if (value === '') {
            value = null;
          }
    
          if (col) {
            acc[key] = convertValue(value, col.dataType, true);
          } else {
            acc[key] = value;
          }
    
          return acc;
        }, {});
      });
    
      const data = {
        [state.objectName]: convertedData
      }
    
      try {
        const res = await postRequest({
          extension: state.endPoint,
          record: JSON.stringify(data)
        });
    
        stack({
          Component: ProgressForm,
          props: {
            recordId: res.recordId,
            access
          },
          width: 500,
          height: 450,
          title: platformLabels.Progress
        });
        invalidate();
        toast.success(platformLabels.Imported);
      } catch (exception) {}
    }

    const actions = [
      {
        key: 'Import',
        condition: true,
        onClick: getImportData
      }
    ]

    return (
        <VertLayout>
            <Fixed>
                <GridToolbar onClear={true} refreshGrid={() => clearFile()}>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <CustomTextField
                      name='name'
                      label={platformLabels.SelectCSV}
                      value={state.name}
                      readOnly={true}
                      disabled={!!state.name}
                    />
                    <Button
                      sx={{ ml: 6, minWidth: '90px !important' }}
                      variant='contained'
                      size='small'
                      disabled={!!state.name}
                      onClick={() => document.getElementById('csvInput').click()}
                    >
                      {platformLabels.Browse}...
                    </Button>
                    <input
                        id="csvInput"
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e)}
                    />
                  </Box>
                </GridToolbar>
            </Fixed>
            <Grow>
              <Table
                  columns={columns}
                  gridData={state.gridData}
                  refetch={refetch}
                  rowId={['recordId']}
                  isLoading={false}
                  pageSize={50}
                  paginationType='api'
                  pagination={false}
                  maxAccess={access}
                  textTransform={true}
              />
            </Grow>
            <Fixed>
              <WindowToolbar smallBox={true} actions={actions} />
            </Fixed>
        </VertLayout>
    )
}

export default BatchImports