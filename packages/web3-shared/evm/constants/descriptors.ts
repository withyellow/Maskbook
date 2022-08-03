import { getEnumAsArray } from '@dimensiondev/kit'
import {
    ChainDescriptor,
    NetworkDescriptor,
    NetworkPluginID,
    ProviderDescriptor,
    TokenType,
} from '@masknet/web3-shared-base'
import CHAINS from './chains.json'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types'
import { getTokenConstant } from './constants'
import { ZERO_ADDRESS } from './primitives'
import { EnhanceableSite, ExtensionSite, isFirefox } from '@masknet/shared-base'

const PLUGIN_ID = NetworkPluginID.PLUGIN_EVM

export const CHAIN_DESCRIPTORS: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>> = CHAINS.map((x) => ({
    ...x,
    coinMarketCapChainId: '',
    coinGeckoChainId: '',
    coinGeckoPlatformId: '',
    type: (x.type as NetworkType | undefined) ?? NetworkType.Ethereum,
    color: x.color ?? 'rgb(24, 163, 138)',
    nativeCurrency: {
        id: getTokenConstant(x.chainId, 'NATIVE_TOKEN_ADDRESS', ZERO_ADDRESS)!,
        address: getTokenConstant(x.chainId, 'NATIVE_TOKEN_ADDRESS', ZERO_ADDRESS)!,
        type: TokenType.Fungible,
        schema: SchemaType.Native,
        ...x.nativeCurrency,
    },
    explorerURL: {
        url: x.explorers?.[0]?.url ?? x.infoURL,
    },
}))

export const NETWORK_DESCRIPTORS: Array<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_ethereum`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Ethereum,
        name: 'Ethereum',
        shortName: 'ETH',
        icon: new URL('../assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(28, 104, 243)',
        averageBlockDelay: 15,
        backgroundGradient:
            'linear-gradient(180deg, rgba(98, 126, 234, 0.15) 0%, rgba(98, 126, 234, 0.05) 100%), rgba(255, 255, 255, 0.2)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_ropsten`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Ropsten,
        type: NetworkType.Ethereum,
        name: 'Ropsten',
        icon: new URL('../assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(255, 65, 130)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_kovan`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Kovan,
        type: NetworkType.Ethereum,
        name: 'Kovan',
        icon: new URL('../assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(133, 89, 255)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_rinkeby`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Rinkeby,
        type: NetworkType.Ethereum,
        name: 'Rinkeby',
        icon: new URL('../assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(133, 89, 255)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_gorli`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Gorli,
        type: NetworkType.Ethereum,
        name: 'G\xf6rli',
        icon: new URL('../assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(48, 153, 242)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_bsc`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.BSC,
        type: NetworkType.Binance,
        name: 'BNB Chain',
        icon: new URL('../assets/binance.png', import.meta.url),
        iconColor: 'rgb(240, 185, 10)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(243, 186, 47, 0.15) 0%, rgba(243, 186, 47, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_bsct`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.BSCT,
        type: NetworkType.Binance,
        name: 'BSCT',
        icon: new URL('../assets/binance.png', import.meta.url),
        iconColor: 'rgb(240, 185, 10)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_polygon`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Matic,
        type: NetworkType.Polygon,
        name: 'Polygon',
        icon: new URL('../assets/polygon.png', import.meta.url),
        iconColor: 'rgb(119, 62, 225)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(130, 71, 229, 0.15) 0%, rgba(130, 71, 229, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_mumbai`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mumbai,
        type: NetworkType.Polygon,
        name: 'Mumbai',
        icon: new URL('../assets/polygon.png', import.meta.url),
        iconColor: 'rgb(119, 62, 225)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_arbitrum`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Arbitrum,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum One',
        shortName: 'Arbitrum',
        icon: new URL('../assets/arbitrum.png', import.meta.url),
        iconColor: 'rgb(36, 150, 238)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(40, 160, 240, 0.15) 0%, rgba(40, 160, 240, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_arbitrum_rinkeby`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Arbitrum_Rinkeby,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum Rinkeby',
        icon: new URL('../assets/arbitrum.png', import.meta.url),
        iconColor: 'rgb(36, 150, 238)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(40, 160, 240, 0.15) 0%, rgba(40, 160, 240, 0.05) 100%)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_xdai`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.xDai,
        type: NetworkType.xDai,
        name: 'Gnosis',
        icon: new URL('../assets/xdai.png', import.meta.url),
        iconColor: 'rgb(73, 169, 166)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(72, 168, 166, 0.15) 0%, rgba(72, 168, 166, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_celo`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Celo,
        type: NetworkType.Celo,
        name: 'Celo',
        icon: new URL('../assets/celo.png', import.meta.url),
        iconColor: 'rgb(53, 208, 127)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(251, 204, 92, 0.15) 0%, rgba(251, 204, 92, 0.05) 100%)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_fantom`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Fantom,
        type: NetworkType.Fantom,
        name: 'Fantom',
        icon: new URL('../assets/fantom.png', import.meta.url),
        iconColor: 'rgb(73, 169, 166)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(24, 94, 255, 0.15) 0%, rgba(24, 94, 255, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_avalanche`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Avalanche,
        type: NetworkType.Avalanche,
        name: 'Avalanche',
        shortName: 'AVAX',
        icon: new URL('../assets/avalanche.png', import.meta.url),
        backgroundGradient: 'linear-gradient(180deg, rgba(232, 65, 66, 0.15) 0%, rgba(232, 65, 66, 0.05) 100%)',
        iconColor: 'rgb(232, 65, 66)',
        averageBlockDelay: 15,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_aurora`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Aurora,
        type: NetworkType.Aurora,
        name: 'Aurora',
        icon: new URL('../assets/aurora.png', import.meta.url),
        iconColor: 'rgb(112, 212, 74)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(112, 212, 75, 0.15) 0%, rgba(112, 212, 75, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_harmony`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Harmony,
        type: NetworkType.Harmony,
        name: 'Harmony',
        icon: new URL('../assets/harmony.png', import.meta.url),
        iconColor: 'rgb(73, 169, 166)',
        averageBlockDelay: 15,
        backgroundGradient: 'linear-gradient(180deg, rgba(112, 212, 75, 0.15) 0%, rgba(112, 212, 75, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_conflux`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Conflux,
        type: NetworkType.Conflux,
        name: 'Conflux',
        icon: new URL('../assets/conflux.png', import.meta.url),
        iconColor: 'rgb(112, 212, 74)',
        averageBlockDelay: 15,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_optimism`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Optimism,
        type: NetworkType.Optimism,
        name: 'Optimism',
        icon: new URL('../assets/optimism.png', import.meta.url),
        iconColor: 'rgb(232, 65, 66)',
        isMainnet: true,
        averageBlockDelay: 15,
    },
]
export const PROVIDER_DESCRIPTORS: Array<ProviderDescriptor<ChainId, ProviderType>> = [
    {
        ID: `${PLUGIN_ID}_maskwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MaskWallet,
        name: 'Mask Network',
        icon: new URL('../assets/maskwallet.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: getEnumAsArray(ExtensionSite).map((x) => x.value),
        },
        homeLink: 'https://mask.io',
        shortenLink: 'mask.io',
        downloadLink: 'https://mask.io/download-links',
        iconFilterColor: 'rgba(28, 104, 243, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_metamask`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MetaMask,
        name: 'MetaMask',
        icon: new URL('../assets/metamask.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: getEnumAsArray(ExtensionSite).map((x) => x.value),
        },
        homeLink: 'https://metamask.io',
        shortenLink: 'metamask.io',
        downloadLink: 'https://metamask.io/download.html',
        iconFilterColor: 'rgba(216, 124, 48, 0.3)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(248, 156, 53, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_walletconnect`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.WalletConnect,
        name: 'WalletConnect',
        icon: new URL('../assets/walletconnect.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: getEnumAsArray(ExtensionSite).map((x) => x.value),
        },
        homeLink: 'https://walletconnect.com',
        shortenLink: 'walletconnect.com',
        downloadLink: 'https://walletconnect.com',
        iconFilterColor: 'rgba(59, 153, 252, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(59, 153, 252, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_coin98`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Coin98,
        name: 'Coin98',
        icon: new URL('../assets/coin98.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: [],
        },
        homeLink: 'https://coin98.com',
        shortenLink: 'coin98.com',
        downloadLink: 'https://coin98insights.com/introduction-to-coin98-wallet-extension',
    },
    {
        ID: `${PLUGIN_ID}_walletlink`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.WalletLink,
        name: 'Coinbase',
        icon: new URL('../assets/coinbase.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: [],
        },
        homeLink: 'https://walletlink.org',
        shortenLink: 'walletlink.org',
        downloadLink: 'https://wallet.coinbase.com/',
    },
    {
        ID: `${PLUGIN_ID}_mathwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MathWallet,
        name: 'MathWallet',
        icon: new URL('../assets/mathwallet.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: [ChainId.Mainnet, ChainId.BSC],
            supportedEnhanceableSites: [],
        },
        homeLink: 'https://mathwallet.org',
        shortenLink: 'mathwallet.org',
        downloadLink: 'https://mathwallet.org/en-us/#extension',
    },
    {
        ID: `${PLUGIN_ID}_fortmatic`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Fortmatic,
        name: 'Fortmatic',
        icon: new URL('../assets/fortmatic.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: isFirefox() ? [] : [ChainId.Mainnet, ChainId.BSC],
            supportedEnhanceableSites: isFirefox() ? [] : getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: isFirefox() ? [] : getEnumAsArray(ExtensionSite).map((x) => x.value),
        },
        homeLink: 'https://fortmatic.com',
        shortenLink: 'fortmatic.com',
        downloadLink: 'https://fortmatic.com',
        iconFilterColor: 'rgba(104, 81, 255, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_torus`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Torus,
        name: 'Torus',
        icon: new URL('../assets/torus.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: [
                ChainId.Mainnet,
                ChainId.BSC,
                ChainId.Matic,
                ChainId.xDai,
                ChainId.Optimism,
                ChainId.Arbitrum,
                ChainId.Avalanche,
            ],
            supportedEnhanceableSites: [],
            supportedExtensionSites: [],
        },
        homeLink: 'https://app.tor.us/',
        shortenLink: 'tor.us',
        downloadLink: 'https://app.tor.us/',
    },
]
