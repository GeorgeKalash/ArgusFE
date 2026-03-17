## General Principle

- Always prioritize consistency over creativity
- Follow existing modules exactly
- Do not introduce new patterns

## Module Placement Rules

## Page Location (STRICT)

- Pages are exposed ONLY in:
  /apps/main/src/pages/[route]/index.js

- Pages must NOT be created in:
  /apps/main/pages
  /apps/main/src/app
  or any other location

- Pages are implemented in:
  /packages/module-[domain]/src/pages/[route]

### Routing

- Route name must match module name
- Example:
  module: pu-payment-terms
  route: /pu-payment-terms

### Export Pattern

In apps/main/src/pages:

export { default } from '@argus/module-[domain]/src/pages/[route]'

---

## Naming Conventions

### Module Name

- kebab-case
- must match route and folder

Example:
pu-payment-terms

---

### Component Name

- PascalCase

Example:
PaymentTerms

---

### Form Name

[ModuleName]Form

Example:
PaymentTermsForm

---

## Page Composition Rules

Each module page MUST follow this structure:

- VertLayout
  - Fixed → GridToolbar
  - Grow → Table

### Required Elements

- useResourceQuery for data fetching
- GridToolbar for actions (add)
- Table for displaying data
- stack() to open form

### Actions

- Add → opens form (no recordId)
- Edit → opens form with recordId
- Delete → calls repository delete + invalidate + toast

## Form Rules

- Form must use:
  - useForm hook
  - yup validation
  - FormShell wrapper

### Behavior

Create:
- call set endpoint
- show success toast

Edit:
- fetch data using get endpoint
- populate form

After submit:
- invalidate query

---

### Inputs

Use ONLY shared components:

- CustomTextField
- CustomNumberField
- ResourceComboBox

DO NOT use raw MUI inputs

## Fields vs Columns

### Form Fields
- define inputs in form

### Grid Columns
- define table columns
- may include computed/API fields

IMPORTANT:
- columns do NOT have to match form fields

## Labels

- All labels must come from useResourceQuery

Example:
_labels.name

- NEVER hardcode text

## Data Fetching

- Must use useResourceQuery
- Must define fetchGridData function
- Must support pagination parameters

- API calls must use:
  getRequest / postRequest from RequestsContext

  ## Table Rules

- Must use shared Table component

Required props:
- columns
- gridData
- rowId
- onEdit
- onDelete
- paginationParameters
- refetch
- maxAccess

- paginationType must be 'api'




## Domain Mapping

- Purchase modules → module-purchase
- Sales modules → module-sales
- etc.

IF unsure:
- follow closest existing module

## ResourceId Rules

- Each module must have a ResourceId
- ResourceId is required for:
  - useResourceQuery
  - FormShell

### Usage

Page:
- datasetId must use ResourceId

Form:
- FormShell must use ResourceId

---

### Source

- ResourceId must come from:
  @argus/shared-domain/src/resources/ResourceIds

---

### When creating a module

IF ResourceId is provided:
- use it directly

IF NOT provided:
- DO NOT invent one
- follow closest existing module OR leave placeholder


## Endpoint Resolution Rules

- Repository is defined as base path

Example:
SalesRepository.SalesOrderSource

- Endpoints must be appended to repository

Example:
qry → SalesRepository.SalesOrderSource.qry

---

### IMPORTANT

- ALWAYS prefix endpoints with repository
- NEVER use endpoint name alone
- NEVER import repository incorrectly

### Example

Repository:
SalesRepository.SalesOrderSource

Endpoints:
- qry: qryORS

Result:
SalesRepository.SalesOrderSource.qry

## Repository Ownership

- Repository structure is controlled by developers
- AI must NOT:
  - create new repositories
  - rename endpoints
  - modify existing repository logic

- AI must ONLY:
  - use provided repository and endpoints

  ## IMPORTANT

- DO NOT invent new patterns
- DO NOT create new structures
- ALWAYS follow closest existing module

Reference:
PaymentTerms is the gold standard for small pages