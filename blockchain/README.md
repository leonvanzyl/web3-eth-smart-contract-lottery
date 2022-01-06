# Overview

For this project I have used Metamask for the wallet. For authentication, the mnemonic is stored in an enviroment variable file (see environment setup below).

In order to connect to the Rinkeby test network, the Infura API was used. The Infura endpoint is also stored in the environment variable file.

# Setting up Environment Variable File

In the root directory, create a file called env.js.
Add the following values to ENV.JS:

```javascript
module.exports = {
INFURA_ENDPOINT: [Infura Endpoint URL],
MNEMONIC: [Your MetaMask Mnemonic],
};
```
