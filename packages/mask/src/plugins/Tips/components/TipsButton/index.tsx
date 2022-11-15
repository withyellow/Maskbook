import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { ProfileIdentifier, NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'
import {
    useCurrentVisitingIdentity,
    useSocialIdentityByUseId,
} from '../../../../components/DataSource/useActivatedUI.js'
import { useProfilePublicKey } from '../../hooks/useProfilePublicKey.js'
import { PluginTipsMessages } from '../../messages.js'
import { useTipsAccounts } from './useTipsAccounts.js'

interface Props extends HTMLProps<HTMLDivElement> {
    // This is workaround solution, link issue mf-2536 and pr #7576.
    // Should refactor social account to support multi-account for one post.
    accounts?: SocialAccount[]
    recipient?: string
    receiver?: ProfileIdentifier
    buttonSize?: number
    iconSize?: number
    onStatusUpdate?(disabled: boolean): void
}

const useStyles = makeStyles<{ iconSize: number }>()((theme, props) => ({
    tipButton: {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, system-ui, sans-serif',
    },
    icon: {
        width: props.iconSize,
        height: props.iconSize,
    },
}))

export const TipButton: FC<Props> = (props) => {
    const {
        className,
        accounts: receivingAccounts = EMPTY_LIST,
        receiver,
        recipient,
        children,
        iconSize = 24,
        onStatusUpdate,
        ...rest
    } = props
    const { classes, cx } = useStyles({ iconSize })

    const { value: personaPubkey, loading: loadingPersona } = useProfilePublicKey(receiver)
    const receiverUserId = receiver?.userId

    const { pluginID } = useNetworkContext()
    const visitingIdentity = useCurrentVisitingIdentity()
    const { value: identity } = useSocialIdentityByUseId(receiverUserId)

    const isVisitingUser = visitingIdentity.identifier?.userId === receiverUserId
    const isRuntimeAvailable = useMemo(() => {
        switch (pluginID) {
            case NetworkPluginID.PLUGIN_EVM:
                return true
            case NetworkPluginID.PLUGIN_SOLANA:
                return isVisitingUser
        }
        return false
    }, [pluginID, isVisitingUser])

    const accountsByIdentity = useTipsAccounts(identity, personaPubkey)
    const accounts = useMemo(
        () =>
            [...receivingAccounts, ...accountsByIdentity].sort((a, z) => {
                const aHasNextId = a.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)
                const zHasNextId = z.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)
                if (aHasNextId === zHasNextId) return 0
                return aHasNextId ? -1 : zHasNextId ? 1 : 0
            }),

        [receivingAccounts, accountsByIdentity],
    )

    const disabled = loadingPersona || accounts.length === 0 || !isRuntimeAvailable

    useEffect(() => {
        onStatusUpdate?.(disabled)
    }, [disabled])

    const createTipTask: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (!accounts.length || !receiverUserId) return
            PluginTipsMessages.tipTask.sendToLocal({
                recipient,
                recipientSnsId: receiverUserId,
                accounts,
            })
        },
        [disabled, recipient, accounts, receiverUserId],
    )

    useEffect(() => {
        if (!receiverUserId || !accounts.length) return
        PluginTipsMessages.tipTaskUpdate.sendToLocal({
            recipient,
            recipientSnsId: receiverUserId,
            accounts,
        })
    }, [recipient, receiverUserId, accounts])

    if (disabled) return null

    return (
        <div className={cx(className, classes.tipButton)} {...rest} role="button" onClick={createTipTask}>
            <Icons.TipCoin className={classes.icon} />
            {children}
        </div>
    )
}
