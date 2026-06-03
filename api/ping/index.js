module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      hasConnectionString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
      hasContainerName:    !!process.env.AZURE_STORAGE_CONTAINER_NAME,
      hasBlobName:         !!process.env.AZURE_STORAGE_BLOB_NAME,
    }),
  }
}
