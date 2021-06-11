# Deployment

## Configuration

You should copy `./public/data/config.template.json` to `./public/data/config.local.json` and modify it to point the `apiEndpoint` to wherever you have deployed the `api` package.

```js
{
    "nodes": [                                      /* List of node to load balance across */  
        {
            "provider": "NODE1",                    /* A node to perform Tangle operations */
            "depth": 3,                             /* Depth to use for attaches */
            "mwm": 9                                /* MWM to use for attaches */
        }
    ],
    "apiEndpoint": "API-ENDPOINT",                  /* URL of the demo API */
     "tangleExplorer": {
        "transactions": "https://explorer.iota.org/devnet/transaction/:transactionHash",
        "bundles": "https://explorer.iota.org/devnet/bundle/:bundleHash",
        "mam": "https://explorer.iota.org/devnet/streams/0/:root/:mode/:key"
    },
    "googleAnalyticsId": "GOOGLE-ANALYTICS-ID"      /* Optional, google analytics id */
}
```

## Build

```shell
npm run build
```

## Deploy

The app is configured to use zeit/now for hosting, you can configure `./now.json` to suit your own setup.

If you want to use a different name for the config file you can specify an environment variable of CONFIG_ID, e.g. set CONFIG_ID to `dev` will load `config.dev.json` instead.

After modifying the configuration files you can deploy using the folllowing commands:

```shell
now
```
