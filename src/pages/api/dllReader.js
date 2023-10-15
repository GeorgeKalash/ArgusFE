import fs from 'fs'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

export default (req, res) => {
  const dllFilePath = path.resolve('./src/dlls/ArgusRPT.dll')
  // Check if the file exists
  if (fs.existsSync(dllFilePath)) {
    // Read the DLL file
    const dllData = fs.readFileSync(dllFilePath)
    console.log({ dllData })

    // Convert the returned Binary to JSON
    // const base64Data = Buffer.from(dllData).toString('base64')

    // Convert the returned Binary to HEX
    // const hexString = Buffer.from(dllData).toString('hex')

    // Return the template as JSON in the response
    res.status(200).json({ data: dllData })
  } else {
    // If the file doesn't exist, return a 404 error
    res.status(404).end('File not found')
  }
}
