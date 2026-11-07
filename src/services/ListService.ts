import { httpClient } from './http/httpClient'

export async function getList<T = unknown>(
  listName: string,
  signal?: AbortSignal,
): Promise<T> {
  const normalizedListName = listName.trim()

  if (!normalizedListName) {
    throw new Error('El nombre de la lista es obligatorio.')
  }

  const response = await httpClient.get(
    `/list/${encodeURIComponent(normalizedListName)}/`,
    signal,
  )

  if (!response.ok) {
    throw new Error(
      `No fue posible consultar la lista "${normalizedListName}" (${response.status}).`,
    )
  }

  return response.json() as Promise<T>
}
