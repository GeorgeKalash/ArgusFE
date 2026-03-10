// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import chat from '@argus/shared-store/src/store/apps/chat'
import user from '@argus/shared-store/src/store/apps/user'
import email from '@argus/shared-store/src/store/apps/email'
import invoice from '@argus/shared-store/src/store/apps/invoice'
import calendar from '@argus/shared-store/src/store/apps/calendar'
import permissions from '@argus/shared-store/src/store/apps/permissions'

export const store = configureStore({
  reducer: {
    user,
    chat,
    email,
    invoice,
    calendar,
    permissions
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
