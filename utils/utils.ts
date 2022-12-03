// import { ethers, providers, utils, Wallet, Contract } from "ethers";
// import fetch from "node-fetch";
// import { diamondCutABI, DiamondLoupeFacetABI } from "./abis";
// const solc = require("solc");
// import { MongoClient } from "mongodb";
// import { Providers , sigProviders} from "./providers";

const START_BLOCK = 29240066;
const UPDATETOPIC = "0x8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb673";

function getTimestamp() {
  return Math.floor(+new Date() / 1000);
}

async function awaitAndFilter(requests: any[]) {
  let result = (await Promise.allSettled(requests))
    .filter((res) => res.status === "fulfilled")
    .map((res: any) => res.value);
  return result;
}

export {
  getTimestamp,
  awaitAndFilter,
};
