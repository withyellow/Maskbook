import { DOMProxy, IntervalWatcher, type DOMProxyEvents } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { parseId } from '../utils/url.js'
import {
    FlattenTypedMessage,
    extractTextFromTypedMessage,
    makeTypedMessageEmpty,
    makeTypedMessageImage,
    makeTypedMessagePromise,
    makeTypedMessageTuple,
    makeTypedMessageTupleFromList,
} from '@masknet/typed-message'
import type { SiteAdaptorUI } from '@masknet/types'
import type { EventListener } from '@servie/events'
import { memoize, noop } from 'lodash-es'
import utils from 'web3-utils'
import Services from '../../../extension/service.js'
import { creator, activatedSiteAdaptor_state } from '../../../site-adaptor-infra/index.js'
import { createRefsForCreatePostContext } from '../../../site-adaptor-infra/utils/create-post-context.js'
import { untilElementAvailable } from '../../../utils/dom.js'
import { getCurrentIdentifier } from '../../utils.js'
import { twitterBase } from '../base.js'
import { injectMaskIconToPostTwitter } from '../injection/MaskIcon.js'
import { twitterShared } from '../shared.js'
import { getPostId, postContentMessageParser, postImagesParser, postParser } from '../utils/fetch.js'
import {
    postsContentSelector,
    postsImageSelector,
    timelinePostContentSelector,
    toastLinkSelector,
} from '../utils/selector.js'
import { IdentityProviderTwitter } from './identity.js'

function getPostActionsNode(postNode: HTMLElement | null) {
    if (!postNode) return null
    return postNode
        .closest('[data-testid="tweet"]')
        ?.querySelector<HTMLElement>('[role="group"]:last-child > div:last-child')
}

const getParentTweetNode = (node: HTMLElement) => {
    return node.closest<HTMLElement>('[data-testid="tweet"]')
}

function isQuotedTweet(tweetNode: HTMLElement | null) {
    return tweetNode?.getAttribute('role') === 'link'
}

function isDetailTweet(tweetNode: HTMLElement) {
    // We can see the retweets status in detail tweet.
    const isDetail = !!tweetNode.querySelector('a[role="link"][href$=retweets],a[role="link"][href$=likes]')
    return isDetail
}

function getTweetNode(node: HTMLElement) {
    // retweet(quoted tweet) in new twitter
    const root = node.closest<HTMLDivElement>('div[role="link"]')
    // then normal tweet
    return root || node.closest<HTMLDivElement>('article > div')
}
const shouldSkipDecrypt = (node: HTMLElement, tweetNode: HTMLElement) => {
    const isCardNode = node.matches('[data-testid="card.wrapper"]')
    const hasTextNode = !!tweetNode.querySelector(
        [
            '[data-testid="tweet"] div[lang]',
            '[data-testid="tweet"] + div div[lang]', // detailed
        ].join(','),
    )

    // if a text node already exists, it's not going to decrypt the card node
    return isCardNode && hasTextNode
}
function registerPostCollectorInner(
    postStore: SiteAdaptorUI.CollectingCapabilities.PostsProvider['posts'],
    cancel: AbortSignal,
) {
    const updateProfileInfo = memoize(
        (info: PostInfo) => {
            const currentProfile = getCurrentIdentifier()
            const profileIdentifier = info.author.getCurrentValue()
            if (!profileIdentifier) return
            Services.Identity.updateProfileInfo(profileIdentifier, {
                nickname: info.nickname.getCurrentValue(),
                avatarURL: info.avatarURL.getCurrentValue()?.toString(),
            })
            if (currentProfile?.linkedPersona) {
                Services.Identity.createNewRelation(profileIdentifier, currentProfile.linkedPersona)
            }
        },
        (info: PostInfo) => info.author.getCurrentValue(),
    )
    new IntervalWatcher(postsContentSelector())
        .useForeach((node, _, proxy) => {
            const tweetNode = getTweetNode(node)
            if (!tweetNode || shouldSkipDecrypt(node, tweetNode)) return
            const refs = createRefsForCreatePostContext()
            let actionsElementProxy: DOMProxy | undefined = undefined
            const actionsInjectPoint = getPostActionsNode(proxy.current)
            let unwatchPostNodeChange = noop
            if (actionsInjectPoint && !isQuotedTweet(tweetNode)) {
                actionsElementProxy = DOMProxy({})
                actionsElementProxy.realCurrent = actionsInjectPoint
                const handleChanged: EventListener<DOMProxyEvents<HTMLElement>, 'currentChanged'> = (e) => {
                    actionsElementProxy!.realCurrent = getPostActionsNode(e.new) || null
                }
                unwatchPostNodeChange = proxy.on('currentChanged', handleChanged)
            }
            const info = twitterShared.utils.createPostContext({
                comments: undefined,
                rootElement: proxy,
                actionsElement: actionsElementProxy,
                isFocusing: isDetailTweet(tweetNode),
                suggestedInjectionPoint: tweetNode,
                ...refs.subscriptions,
            })
            function run() {
                collectPostInfo(tweetNode, refs, cancel)
                collectLinks(tweetNode, refs, cancel)
            }
            run()
            cancel.addEventListener(
                'abort',
                info.hasMaskPayload.subscribe(() => {
                    const payload = info.hasMaskPayload.getCurrentValue()
                    if (!payload && refs.postMetadataImages.size === 0) return
                    updateProfileInfo(info)
                }),
            )
            injectMaskIconToPostTwitter(info, cancel)
            postStore.set(proxy, info)
            return {
                onTargetChanged: run,
                onRemove: () => {
                    postStore.delete(proxy)
                    unwatchPostNodeChange()
                },
                onNodeMutation: run,
            }
        })
        .assignKeys((node) => {
            const tweetNode = getTweetNode(node)
            const parentTweetNode = isQuotedTweet(tweetNode) ? getParentTweetNode(tweetNode!) : null
            if (!tweetNode || shouldSkipDecrypt(node, tweetNode)) {
                return `keccak256:${utils.keccak256(node.innerText)}`
            }
            const parentTweetId = parentTweetNode ? getPostId(parentTweetNode) : ''
            const tweetId = getPostId(tweetNode)
            // To distinguish tweet nodes between timeline and detail page
            const isDetailPage = isDetailTweet(tweetNode)
            return `${isDetailPage ? 'detail' : 'normal'}/${parentTweetId}/${tweetId}`
        })
        .startWatch(250, cancel)
}

export const PostProviderTwitter: SiteAdaptorUI.CollectingCapabilities.PostsProvider = {
    posts: creator.EmptyPostProviderState(),
    start(cancel) {
        registerPostCollectorInner(this.posts, cancel)
    },
}

export function getPostIdFromNewPostToast() {
    const toastLinkNode = toastLinkSelector().evaluate()
    return toastLinkNode?.href ? parseId(toastLinkNode?.href) : ''
}

export function collectVerificationPost(keyword: string) {
    const userId =
        IdentityProviderTwitter.recognized.value.identifier || activatedSiteAdaptor_state!.profiles.value[0].identifier
    const postNodes = timelinePostContentSelector().evaluate()

    for (const postNode of postNodes) {
        const tweetNode = postNode.closest<HTMLElement>('[data-testid=tweet]')
        if (!tweetNode) continue
        const postId = getPostId(tweetNode)
        const postContent = postContentMessageParser(postNode)
        const content = extractTextFromTypedMessage(postContent)
        const isVerified =
            postId &&
            content.some &&
            content.val.toLowerCase().replaceAll(/\r\n|\n|\r/gm, '') ===
                keyword.toLowerCase().replaceAll(/\r\n|\n|\r/gm, '')

        if (isVerified && userId) {
            return new PostIdentifier(userId, postId)
        }
    }

    return null
}

function collectPostInfo(
    tweetNode: HTMLDivElement | null,
    info: ReturnType<typeof createRefsForCreatePostContext>,
    cancel: AbortSignal,
) {
    if (!tweetNode) return
    if (cancel?.aborted) return
    const { pid, messages, handle, name, avatar } = postParser(tweetNode)

    if (!pid) return
    const postBy = ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(null)
    info.postID.value = pid
    info.postBy.value = postBy
    info.nickname.value = name
    info.avatarURL.value = avatar || null

    // decode steganographic image
    // don't add await on this
    const images = untilElementAvailable(postsImageSelector(tweetNode), 10000)
        .then(() => postImagesParser(tweetNode))
        .then((urls) => {
            for (const url of urls) info.postMetadataImages.add(url)
            if (urls.length) return makeTypedMessageTupleFromList(...urls.map((x) => makeTypedMessageImage(x)))
            return makeTypedMessageEmpty()
        })
        .catch(() => makeTypedMessageEmpty())

    info.postMessage.value = FlattenTypedMessage.NoContext(
        makeTypedMessageTuple([messages, makeTypedMessagePromise(images)]),
    )
}

function collectLinks(
    tweetNode: HTMLDivElement | null,
    info: ReturnType<typeof createRefsForCreatePostContext>,
    cancel: AbortSignal,
) {
    if (!tweetNode) return
    if (cancel?.aborted) return
    const links = [...tweetNode.querySelectorAll('a')].filter((x) => x.rel)
    const seen = new Set<string>(['https://help.twitter.com/using-twitter/how-to-tweet#source-labels'])
    for (const x of links) {
        if (seen.has(x.href)) continue
        seen.add(x.href)
        info.postMetadataMentionedLinks.set(x, x.href)
        Services.Helper.resolveTCOLink(x.href)
            .then((val) => {
                if (cancel?.aborted) return
                if (!val) return
                info.postMetadataMentionedLinks.set(x, val)
            })
            .catch(() => {})
    }
}
