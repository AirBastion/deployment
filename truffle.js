require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');
const LoomTruffleProvider = require('loom-truffle-provider');
const { readFileSync } = require('fs');
const { join } = require('path');

const chainId = 'default';
const writeUrl = 'http://ip-172-31-39-193:46658/rpc';
const readUrl = 'http://ip-172-31-39-193:46658/query';
const privateKey = readFileSync('./private_key', 'utf-8');

const loomTruffleProvider = new LoomTruffleProvider(
  chainId,
  writeUrl,
  readUrl,
  privateKey
);
loomTruffleProvider.createExtraAccountsFromMnemonic(
  'gravity top burden flip student usage spell purchase hundred improve check genre',
  10
);

module.exports = {
  contracts_build_directory: join(__dirname, './build/contracts'),
  networks: {
    develop: {
      provider() {
        return new HDWalletProvider(
          process.env.TRUFFLE_MNEMONIC,
          'http://localhost:9545/'
        );
      },
      host: 'localhost',
      port: 9545,
      network_id: 4447
    },
    ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
      gas: 10000000,
      gasPrice: 1000000000
    },
    kovan: {
      provider() {
        // using wallet at index 1 ----------------------------------------------------------------------------------------v
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY,
          1
        );
      },
      network_id: 42,
      gas: 5561260
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY
        );
      },
      network_id: 4,
      gas: 4700000,
      gasPrice: 20000000000
    },
    ropsten: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY
        );
      },
      network_id: 2,
      gas: 4700000
    },
    sokol: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://sokol.poa.network'
        );
      },
      gasPrice: 1000000000,
      network_id: 77
    },
    poa: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://core.poa.network'
        );
      },
      gasPrice: 1000000000,
      network_id: 99
    },
    sideChain: {
      provider: loomTruffleProvider,
      network_id: '*'
    },
    ethereum: {
      provider() {
        return new HDWalletProvider(
          process.env.ETHEREUM_MENMONIC,
          'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY
        );
      }
    }
  },
  mocha: {
    useColors: true
  },
  solc: {
    optimzer: {
      enabled: true,
      runs: 200
    }
  }
};
