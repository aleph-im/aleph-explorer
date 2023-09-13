export const toUnixTimestamp = d => d ? new Date(d).getTime() / 1000 : undefined

export const downloadBlob = (blob, fileName) => {
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = fileName
  link.click()
}