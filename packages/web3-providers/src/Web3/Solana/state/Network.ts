import type { Plugin } from '@masknet/plugin-infra'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-solana'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkState } from '../../Base/state/Network.js'

export class Network extends NetworkState<ChainId, SchemaType, NetworkType> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            getNetworkPluginID: () => NetworkPluginID.PLUGIN_SOLANA,
        })
    }
}