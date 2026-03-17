## General Principle

Follow existing modules exactly.
Consistency is more important than optimization.

# Small Page Pattern (ERP)

## Description
Simple CRUD page with:
- Data grid (Table)
- Modal form (stack)
- Max ~6 fields
- No complex logic

---

## Architecture

### Page Structure

- Located in:
  /packages/module-*/src/pages/[module]

- Must include:
  - useResourceQuery for fetching
  - GridToolbar for actions
  - Table for data display
  - stack() to open form

---

## Layout Pattern

Use:

- VertLayout
  - Fixed → GridToolbar
  - Grow → Table

---

## Data Fetching

- Use useResourceQuery
- API via Repository (e.g. PurchaseRepository)
- Must support pagination

---

## Table

- Define columns with:
  - field
  - headerName (labels)
  - flex

- Must support:
  - edit
  - delete
  - pagination (api)

---

## Actions

### Add
- opens form via stack()

### Edit
- pass recordId to form

### Delete
- call repository delete endpoint
- invalidate query
- show toast

---

## Form Pattern

- Wrapped with FormShell
- Uses useForm hook
- Uses yup validation

---

## Form Behavior

### Create
- call `.set`
- show "Added"

### Edit
- fetch via `.get`
- populate form
- show "Edited"

### After Submit
- invalidate query

---

## Inputs

Use ONLY shared components:

- CustomTextField
- CustomNumberField
- ResourceComboBox

---

## Validation

- yup schema
- required fields must be enforced

---

## API Rules

- NEVER call API directly
- ALWAYS use Repository

---

## Reference Example

- PaymentTerms (gold standard)


## Fields vs Columns

### Form Fields
- Define inputs shown in the form
- Used in validation and submission

### Grid Columns
- Define what appears in the table
- Can include:
  - form fields
  - computed fields (e.g. ptName)
  - API-returned fields

### IMPORTANT

- Columns are NOT required to match form fields
- Always follow API response structure for columns

## Requests & Context

- API calls must use:
  - getRequest
  - postRequest

- Must be accessed via:
  RequestsContext

- Do NOT use fetch / axios directly

## useResourceQuery

Must include:

- queryFn (fetchGridData)
- endpointId
- datasetId

Must return:

- data
- labels (_labels)
- invalidate
- paginationParameters
- refetch
- access

## Labels

- Labels must come from useResourceQuery

Example:
_labels.name

- NEVER hardcode text in:
  - columns
  - inputs

  ## Table

Must use shared Table component

Required props:

- columns
- gridData
- rowId (must be ['recordId'])
- onEdit
- onDelete
- pageSize (default 50)
- paginationParameters
- refetch
- maxAccess

- paginationType must be 'api'

## FormShell

- Must wrap the entire form

Required props:

- resourceId
- form (formik)
- maxAccess
- editMode

## Edit Mode

- editMode = !!recordId

- If recordId exists:
  - fetch data using get endpoint
  - populate form using formik.setValues

  ## Invalidate

- After create/update/delete:
  - must call invalidate()

- invalidate must use:
  useInvalidate OR useResourceQuery.invalidate

  ## Access Control

- maxAccess must be passed to:
  - GridToolbar
  - Table
  - FormShell
  - all inputs

  ## IMPORTANT

- DO NOT create new components
- DO NOT change layout structure
- DO NOT introduce new patterns
- ALWAYS follow PaymentTerms exactly

