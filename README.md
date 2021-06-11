# IOTA P2P Energy PoC

This package is an implementation of the P2P Energy Blueprint [https://docs.iota.org/docs/blueprints/0.1/p2p-energy/overview](https://docs.iota.org/docs/blueprints/0.1/p2p-energy/overview)

## Demonstration

The Demonstration contains a React Web UI with an API to back it, which shows an overview of all the entities interacting.

See [./demo/README.md](./demo/README.md) for more details.

A deployed version of the demonstration is available at the following urls:

* demo - <https://p2p-energy.iota.org>
* api - <https://p2p-energy-api.iota.org>

The demonstration is limited with the number of entities it can create as it is all running inside the browser. In a real system each entity would most likely be a separate physical device and so no such limitation would apply.

### Details

For this demonstration the `Source` and `Consumers` generate values every 30s, so you will not see data immediately.
In a real world system the updates would most likely be spaced at even longer intervals.

Payment is only requested from `Consumers` on whole kWh, so they will have no outstanding balance until they have accumulated some
usage. `Consumers` only pay the grid when they reach multiples of 25i.

Once the `Grid` receives payments from the `Consumers` it takes 20% of the payment for its running costs and then distributes
the rest to the `Producers` weighted by how much they have contributed to the `Grid`.

Payment distribution from the `Grid` to the `Producers` is executed at 40i intervals.

All of the payments in this demonstration are made from and to a central wallet, and transactions only appear when they are confirmed. In a real world
system each entity would have its own wallet.

All of the timing and payment strategies are easily replaceable in the source code provided.

## Standalone

The standalone folder contains examples of how to write `grid`, `producer`, `consumer`, `source` as standalone entities. It is easy to replace certain features within these components using pluggable services, such as storage and registration. This means the entities could be run on lower power embedded devices using remote services for some of their actions.

See [./standalone/README.md](./standalone/README.md) for more details.

An explanation of the interaction between these modules can be found here [./docs/workflow.md](./docs/workflow.md)

## Common

Both the `demonstration` and the `standalone` packages share a large percentage of their code, the shared code can be found in the `common` library.

## License

MIT License - Copyright (c) 2019 IOTA Stiftung
