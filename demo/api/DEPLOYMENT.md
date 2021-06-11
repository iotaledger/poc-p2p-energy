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
    "s3Connection": {
        "region": "AWS-REGION",                      /* AWS Region e.g. eu-central-1 */
        "accessKeyId": "AWS-ACCESS-KEY-ID",          /* AWS Access Key e.g. AKIAI57SG4YC2ZUCSABC */
        "secretAccessKey": "AWS-SECRET-ACCESS-KEY",  /* AWS Secret e.g. MUo72/UQWgL97QArGt9HVUA */
        "bucketPrefix": "BUCKET-PREFIX"              /* AWS S3 bucket name prefix e.g. poc-p2p-dev- */
    },
    "dynamoDbConnection": {
        "region": "AWS-REGION",                      /* AWS Region e.g. eu-central-1 */
        "accessKeyId": "AWS-ACCESS-KEY-ID",          /* AWS Access Key e.g. AKIAI57SG4YC2ZUCSABC */
        "secretAccessKey": "AWS-SECRET-ACCESS-KEY",  /* AWS Secret e.g. MUo72/UQWgL97QArGt9HVUA */
        "dbTablePrefix": "DATABASE-TABLE-PREFIX"     /* Prefix for database table names e.g. poc-p2p-dev- */
    },
    "walletSeed": "WALLET-SEED"                      /* Wallet Seed for demonstration */
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