import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useWeb3Utils } from './useWeb3Utils.js'
import type { UseQueryResult } from '@tanstack/react-query'

type T = UseQueryResult
export function useGasOptions<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: HubOptions<T>,
    live?: boolean,
) {
    const { chainId } = useChainContext<T>({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)
    const Utils = useWeb3Utils(pluginID)

    return useQuery({
        queryKey: ['get-gas-options', pluginID, chainId, options],
        queryFn: async () => {
            if (!Utils.isValidChainId(chainId)) return
            return Hub.getGasOptions!(chainId, options)
        },
        refetchInterval: live ? Utils.getAverageBlockDelay?.(chainId) ?? 10 : false,
    })
}
