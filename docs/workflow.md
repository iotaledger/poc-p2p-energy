# Workflows

## Grid

The **Grid** is the central component for processing data, it is connected to by **Producers** and **Consumers**.

It is implemented as a REST API and the routes it provides can be seen in [../standalone/grid/src/index.ts](../standalone/grid/src/index.ts)

### Grid Services

When the **Grid** REST API starts it registers the following services:

* registration-storage - The service which stores registration details and can use either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the registration details in the local file system
    * [AmazonS3RegistrationService](../common/src/services/amazon/amazonS3RegistrationService.ts) - Store the registration details in an Amazon Dynamo DB

* grid-storage-manager-state - The service which stores the current state of the **Grid** component in either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the **Grid** state in the local file system
    * [AmazonS3StorageService](../common/src/services/amazon/amazonS3StorageService.ts) - Store the **Grid** state in an Amazon S3 Bucket

* wallet-state - The service which stores the current **Grid** wallet state in etiher:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the wallet state in the local file system
    * [AmazonS3StorageService](../common/src/services/amazon/amazonS3StorageService.ts) - Store the wallet state in Amazon S3 bucket

* wallet - The service which processes wallet transactions
    * [BasicWalletService](../common/src/services/wallet/basicWalletService.ts) - Basic wallet handling which just increments the address index on each transfer

* registration-management - [RegistrationManagementService](../common/src/services/registrationManagementService.ts) handles the `/registration` endpoints for **Producers/Consumers** and stores the information using the **registration-storage** service. Is also polled from a scheduler to see if there are any new commands on the registered MAM channels.

* grid - The [GridManager](../common/src/services/gridManager.ts) logic which handles the commands from the **Producers** and **Consumers**. Uses a [BasicGridStrategy](../common/src/strategies/basicGridStrategy.ts) to determine how to process data.

* storage - Handles the functionality for the `/storage` endpoints, either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Use local file system for storage
    * [AmazonS3StorageService](../common/src/services/amazon/amazonS3StorageService.ts) - Use Amazon S3 for storage

* grid-producer-output-store - Stores a cached version of the **Producers** output read from the MAM channel for processing, either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Stores in Local file system
    * [ProducerOutputStoreService](../common/src/services/db/producerOutputStoreService.ts) - Stores in Amazon Dynamo DB

* grid-consumer-usage-store- Stores a cached version of the **Consumers** output read from the MAM channel for processing, either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Stores in Local file system
    * [ConsumerUsageStoreService](../common/src/services/db/consumerUsageStoreService.ts) - Stores in Amazon Dynamo DB

### Grid Logic

The `/registration` endpoints accept MAM channel details from the **Producers** and **Consumers** through the **registration-management** service. This information is then stored using the **registration-storage** service.

The `/storage` endpoints allow any registered entity to store data within the **Grid** if they have no storage of their own, they do not need to be used.

The **registration-management** service polls at regular intervals to see if there are any more commands from the **Producer/Consumer** MAM channels. Any new messages are handed to the **grid** service, which stores them using the **grid-producer-output-store** and **grid-consumer-usage-store**.

The **grid** service also polls at regular intervals to update its strategies. The strategies determine for each registered entity how its data should be processed i.e. how often an entity get paid or has payment requested etc. The strategies return a list of new commands to send on the MAM channels back to the specific entity.

## Producers

A **Producer** is used to aggregate the information from a number of **Sources**.

The **Producers** much like the **Grid** run as a REST API with a smilar set of routes [../standalone/producer/src/index.ts](../standalone/producer/src/index.ts)

### Producer Services

When the **Producer** REST API starts it registers the following services:

* producer-registration - The service which registers the **Producer** with a **Grid**:
    * [ApiRegistrationService](../common/src/services/storage/apiRegistrationService.ts) - Perform registration using a remote API

* registration-storage - The service which stores registration details and can use either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the registration details in the local file system
    * [ApiStorageService](../common/src/services/storage/apiStorageService.ts) - Store the registration details using a remote API (e.g. using the **Grid** endpoints)

* producer-storage-manager-state - The service which stores the current state of the **Producer**  component in either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the **Producer** state in the local file system
    * [ApiStorageService](../common/src/services/storage/apiStorageService.ts) - Store the **Producer** state using a remote API (e.g. using the **Grid** endpoints)

* wallet-state - The service which stores the current **Producer** wallet state in etiher:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the wallet state in the local file system
    * [ApiStorageService](../common/src/services/storage/apiStorageService.ts) - Store the wallet state using a remote API (e.g. using the **Grid** endpoints)

* wallet - The service which processes wallet transactions
    * [BasicWalletService](../common/src/services/wallet/basicWalletService.ts) - Basic wallet handling which just increments the address index on each transfer

* registration-management - [RegistrationManagementService](../common/src/services/registrationManagementService.ts) handles the `/registration` endpoints and stores the **Source** information using the **registration-storage** service. Is also polled from a scheduler to see if there are any new commands on the registered MAM channels.

* producer - The [ProducerManager](../common/src/services/producerManager.ts) logic which handles the commands from the **Sources**. Uses a [BasicProducerStrategy](../common/src/strategies/basicProducerStrategy.ts) to determine how to process data.

* storage - Handles the functionality for the `/storage` endpoints, either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Use local file system for storage
    * [ApiStorageService](../common/src/services/storage/ApiStorageService.ts) - Use remote api for storage

* producer-source-output-store - Stores a cached version of the **Sources** output read from the MAM channel for processing, either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Stores in Local file system
    * [ApiStorageService](../common/src/services/storage/ApiStorageService.ts) - Use remote api for storage

### Producer Logic

The `/registration` endpoints accept MAM channel details from the **Sources** through the **registration-management** service. This information is then stored using the **registration-storage** service.

The `/storage` endpoints allow any registered entity to store data within the **Procucer** using the **storage** service if they have no storage themselves.

The **registration-management** service polls at regular intervals to see if there are any more commands from the **Sources** MAM channels. Any new messages are handed to the **producer** service, which stores them using the **producer-source-output-store**.

The **producer** service also polls at regular intervals to update its strategies. The strategies determine for each registered **Source** how its data should be processed.

## Sources

A **Source** produces power output data and send it to a **Producer** to aggregate.

### Source Services

* source-storage-manager-state - The service which stores the current state of the **Source** component in either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the **Source** state in the local file system
    * [ApiStorageService](../common/src/services/storage/apiStorageService.ts) - Store the **Source** state using a remote API (e.g. using the **Producer** endpoints)

* source-registration - The service which registers the **Source** with a **Producer**:
    * [ApiRegistrationService](../common/src/services/storage/apiRegistrationService.ts) - Perform registration using a remote API

### Source Logic

A **Source** register with a **Producer** on startup. It then publishes output data messages in its MAM channel which the **Producer** will fetch.

## Consumer

A **Consumer** consumes power from the **Grid** and makes payments in return.

### Consumer Services

* consumer-registration - The service which registers the **Consumer** with a **Grid**:
    * [ApiRegistrationService](../common/src/services/storage/apiRegistrationService.ts) - Perform registration using a remote API

* consumer-storage-manager-state - The service which stores the current state of the **Consumer** component in either:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the **Consumer** state in the local file system
    * [ApiStorageService](../common/src/services/storage/apiStorageService.ts) - Store the **Consumer** state using a remote API (e.g. using the **Grid** endpoints)

* wallet-state - The service which stores the current **Consumer** wallet state in etiher:
    * [LocalFileStorageService](../common/src/services/storage/localFileStorageService.ts) - Store the wallet state in the local file system
    * [ApiStorageService](../common/src/services/storage/apiStorageService.ts) - Store the wallet state using a remote API (e.g. using the **Grid** endpoints)

* wallet - The service which processes wallet transactions
    * [BasicWalletService](../common/src/services/wallet/basicWalletService.ts) - Basic wallet handling which just increments the address index on each transfer

### Consumer Logic

A **Consumer** register with a **Grid** on startup. It then publishes usage data messages in its MAM channel which the **Grid** will fecth. The **Grid** will return payment request information in another MAM channel which the **Consumer** must read.

The **Consumer** must make payments from its wallet to the payment address specified in the payment request payloads.

