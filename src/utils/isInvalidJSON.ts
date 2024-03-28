export default function isInvalidJSON(json: string) {
  try {
    return JSON.parse(json)
  } catch (error) {
    return false
  }
}
