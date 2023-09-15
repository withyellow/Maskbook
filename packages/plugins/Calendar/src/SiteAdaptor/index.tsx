import { type Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { Trans } from 'react-i18next'
import { PLUGIN_ID } from '../constants.js'
import React from 'react'
import { Icons } from '@masknet/icons'

const recommendFeature = {
    description: <Trans i18nKey="description" ns={PLUGIN_ID} />,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            icon: <Icons.Calendar />,
            name: <Trans ns={PLUGIN_ID} i18nKey="title" />,
            category: 'dapp',
            recommendFeature,
            description: recommendFeature.description,
        },
    ],
}

export default site
