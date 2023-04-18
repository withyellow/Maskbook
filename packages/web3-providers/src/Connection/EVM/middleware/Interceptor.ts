import { Composer, type ConnectionContext, type Middleware, ProviderType } from '@masknet/web3-shared-evm'
import { NoneWallet } from '../interceptors/None.js'
import { MaskWallet } from '../interceptors/MaskWallet.js'
import { WalletConnect } from '../interceptors/WalletConnect.js'
import { MetaMask } from '../interceptors/MetaMask.js'
import { Fortmatic } from '../interceptors/Fortmatic.js'
import { ContractWallet } from '../interceptors/ContractWallet.js'
import { Popups } from '../interceptors/Popups.js'
import { SmartPayAccountAPI, SmartPayBundlerAPI, SmartPayFunderAPI } from '../../../SmartPay/index.js'

export class Interceptor implements Middleware<ConnectionContext> {
    private Account = new SmartPayAccountAPI()
    private Bundler = new SmartPayBundlerAPI()
    private Funder = new SmartPayFunderAPI()

    private composers: Partial<Record<ProviderType, Composer<ConnectionContext>>> = {
        [ProviderType.None]: Composer.from(new NoneWallet()),
        [ProviderType.MaskWallet]: Composer.from(
            new Popups(),
            new ContractWallet(ProviderType.MaskWallet, this.Account, this.Bundler, this.Funder),
            new MaskWallet(),
        ),
        [ProviderType.MetaMask]: Composer.from(new MetaMask()),
        [ProviderType.WalletConnect]: Composer.from(new WalletConnect()),
        [ProviderType.Coin98]: Composer.from(new MetaMask()),
        [ProviderType.WalletLink]: Composer.from(new MetaMask()),
        [ProviderType.MathWallet]: Composer.from(new MetaMask()),
        [ProviderType.Fortmatic]: Composer.from(new Fortmatic()),
        [ProviderType.Opera]: Composer.from(new MetaMask()),
        [ProviderType.Clover]: Composer.from(new MetaMask()),
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const composer = this.composers[context.providerType]
        if (!composer || !context.writeable) {
            await next()
            return
        }

        await composer.dispatch(context, next)
    }
}