# Deployment

## Configuration

To configure the `api` you should copy `./src/data/config.template.json` to `./src/data/config.local.json` and modify the content.

```js
{
    "nodes": [                                      /* List of node to load balance across */  
        {
            "provider": "NODE1",                    /* A node to perform Tangle operations */
            "depth": 3,                             /* Depth to use for attaches */
            "mwm": 9                                /* MWM to use for attaches */
        }
    ],
    "producerApiEndpoint": "https://PRODUCER-ENDPOINT",  /* Endpoint for the producer api */
    "source": {
        "id": "SOURCE-UNIQUE-ID",                        /* Unique ID, has no format */
        "name": "SOURCE-NAME",                           /* The name of this source */
        "type": "SOURCE-TYPE"                            /* Type of this source e.g. solar, wind */
    }
}
```

## Build

```shell
npm run build
```

## Deploy

The `api` package is setup to be deployed to zeit/now, you should modify the config in `./now.json` to suit your own requirements and then execute the following.

If you want to use a different name for the config file you can specify an environment variable of CONFIG_ID, e.g. set CONFIG_ID to `dev` will load `config.dev.json` instead.

```shell
now
```