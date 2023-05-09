import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                isValidAddress,
                isSameAddress,
                formatAddress: formatEthereumAddress,
            },
        )
    }
}