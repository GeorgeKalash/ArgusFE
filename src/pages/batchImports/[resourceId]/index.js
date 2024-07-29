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
import { formatDate, formatDateDefault, formatDateForImport } from 'src/lib/date-helper'
import { ProgressForm } from 'src/components/Shared/ThreadProgress'
import { useWindow } from 'src/windows'
import { useError } from 'src/error'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

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

const parseCSV = (text, columns) => {
  const lines = text.split('\n').filter(line => line.trim());

  if (lines.length === 0) return;

  const headers = lines[0].split(',').map(header => header.trim());

  const columnMap = columns.reduce((map, col) => {
    map[col.headerName] = col;

    return map;
  }, {});

  const orderedColumns = headers.map(header => columnMap[header]);

  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());

    return orderedColumns.reduce((obj, col, index) => {
      const header = headers[index];
      if (col) {
        obj[col.field] = convertValue(values[index], col.dataType);
      } else {
        obj[header] = values[index];
      }

      return obj;
    }, {});
  });

  return transform(rows);
};

const getImportData = (gridData, columns, stackError) => {
  const mandatoryColumns = columns.filter(col => col.mandatory);

  const missingFields = gridData.list.flatMap(row =>
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

  const convertedData = gridData.list.map(row => {
    return Object.keys(row).reduce((acc, key) => {
      const col = columns.find(c => c.field === key);
      let value = row[key];
      value = value === '' ? null : value;
      acc[key] = col ? convertValue(value, col.dataType, true) : value;

      return acc;
    }, {});
  });

  return convertedData;
};

const BatchImports = () => {
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const router = useRouter()

  const [columns, setColumns] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [name, setName] = useState('');
  const [objectName, setObjectName] = useState('');
  const [endPoint, setEndPoint] = useState('');

  const { getRequest, postRequest } = useContext(RequestsContext)
  const { resourceId } = router.query
  const { platformLabels } = useContext(ControlContext)

  const {
    access
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

            const modifiedFields = res.record.fields.map(({ name, dataType, ...rest }) => ({
              field: name,
              headerName: name,
              type : (dataType == 2 || dataType == 3) && "number",
              flex: 1,
              ...rest,
            }))

            setColumns([
              { field: 'recordId', headerName: '', flex: .4 },
              ...modifiedFields
            ])

            setObjectName(res.record.objectName);
            setEndPoint(res.record.endPoint);
        }
      } catch (exception) {}
    })();
  }, []);

  const refetch = () => {
    setGridData(prevGridData => {
      const transformedData = transform(prevGridData.list);

      return transformedData
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]

    setName(file.name);

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const data = parseCSV(text, columns)
        setGridData(data)
      }
      reader.readAsText(file)
    }
  }

  const clearFile = () => {
    setName('');
    setGridData([]);
    document.getElementById('csvInput').value = null;
    refetch();
  };

  const handleClick = async () => {
    const convertedData = getImportData(gridData, columns, stackError)

    const data = {
      [objectName]: convertedData
    };

    try {
      const res = await postRequest({
        extension: endPoint,
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
  
      toast.success(platformLabels.Imported);
    } catch (exception) {}
  }

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: () => handleClick(),
      disabled: !name
    }
  ];

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onClear={true} refreshGrid={clearFile}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <CustomTextField
              name='name'
              label={platformLabels.SelectCSV}
              value={name}
              readOnly={true}
              disabled={!!name}
            />
            <Button
              sx={{ ml: 6, minWidth: '90px !important' }}
              variant='contained'
              size='small'
              disabled={!!name}
              onClick={() => document.getElementById('csvInput').click()}
            >
              {platformLabels.Browse}...
            </Button>
            <input
              id="csvInput"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>
        </GridToolbar>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
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