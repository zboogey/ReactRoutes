import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteProduct, getProductById, getProducts } from '../services/service'

export const productKeys = {
  all: ['products'],
  detail: (id) => ['products', id],
}

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: ({ signal }) => getProducts(signal),
  })
}

export function useProduct(id) {
  const validId = /^\d+$/.test(id)
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => (validId ? getProductById(id, signal) : Promise.reject(new Error('NOT_FOUND'))),
    retry: (count, err) => err.message !== 'NOT_FOUND' && count < 2,
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
