const Iota = require('@iota/core');

// Connect to a node
const iota = Iota.composeAPI({
    provider: 'https://nodes.devnet.thetangle.org:443'
});

// Define the security level of the address
const securityLevel = 2;

// The seed that will be used to generate an address
const seed =
    'WALLET_SEED';


// If this address is spent, this method returns the next unspent address with the lowest index
iota.getNewAddress(seed, { index: 0, securityLevel: securityLevel, total: 1 })
    .then(address => {
        console.log('Your address is: ' + address);
    })
    .catch(err => {
        console.log(err)
    });
