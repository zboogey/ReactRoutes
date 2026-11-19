import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteProduct, getProductById, getProducts } from '../services/service'

export const productKeys = {
  all: ['products'],
  detail: (id) => ['products', id],
}

// data = product array, cachedAt = timestamp if the response came from the service worker cache
export function useProducts() {
  const query = useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => getProducts(signal),
  })
  return { ...query, data: query.data?.items, cachedAt: query.data?.cachedAt }
}

export function useProduct(id) {
  const queryClient = useQueryClient()
  const validId = /^\d+$/.test(id)
  const query = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => (validId ? getProductById(id, signal) : Promise.reject(new Error('NOT_FOUND'))),
    // The list already contains full product objects: show the item instantly (and offline) from it
    initialData: () => {
      const list = queryClient.getQueryData(productKeys.all)
      const item = list?.items.find((p) => String(p.id) === id)
      return item ? { item, cachedAt: list.cachedAt } : undefined
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(productKeys.all)?.dataUpdatedAt,
  })
  return { ...query, data: query.data?.item, cachedAt: query.data?.cachedAt }
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
