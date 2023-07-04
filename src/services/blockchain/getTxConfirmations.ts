import { Hash } from "viem";
import { getClient } from "./config.blockchain";

// checks if the tx has not been reorged and returns the number of confirmations
async function getTxConfirmations(txHash: Hash, latestBlockNumber: bigint): Promise<number>{
  const blockchainClient = getClient("localhost");
  const txBlockNumber = (
    await blockchainClient.getTransaction({
      hash: txHash
    })
  )?.blockNumber as bigint;
  
  if(!txBlockNumber){
    console.log(`getTxConfirmations_Failed: ${txHash} has been reorged`)
    throw Error("Failed to get confirmations");
  }

  const confirmations = Number(latestBlockNumber - txBlockNumber) + 1;
  return confirmations > 0 ? confirmations : 0;
}

export default getTxConfirmations;