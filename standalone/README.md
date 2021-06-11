# IOTA P2P Energy PoC Standalone

The standalone components consists of 4 packages `grid`, `producer`, `source` and `consumer`, one for each of the main entities within the blueprint.

## Grid

The Grid facilitates all the services required by `producers` and `consumers`.
It is a set of services running on NodeJS connecting to the Tangle, Amazon S3, Amazon DynamoDB.

See [./grid/README.md](./grid/README.md) for more details.

## Producer

The Producer package provides the features required by `sources`.
It is a set of services running on NodeJS connecting to the Tangle and the Grid.

See [./producer/README.md](./producer/README.md) for more details.

## Source

The Source package provides the features required by a `source`.
It is an element connecting to the Producer API.

See [./source/README.md](./source/README.md) for more details.

## Consumer

The Consumer package provides the features required by a `consumer`.
It is an element connecting to the Grid API.

See [./consumer/README.md](./consumer/README.md) for more details.
