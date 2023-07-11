import { Socket } from "socket.io";
import getTxConfirmations from "./getTxConfirmations";
import { Hash } from "viem";
import { TransactionEvents } from "../../sockets/events";

// minimum no. of confirmations needed to confirm swap
const minConfirmations = 5;
const maxRetries = 3;

// monitors the tx for block reorgs and makes payout when it has enough confirmatiions.
// uses recursion to handle reorgs. Check the catch block.

function monitorTx(blockchainClient: any, socket: Socket, txHash: Hash, retries: number, sendNaira: () => void){

  const unWatchBlocks = blockchainClient.watchBlockNumber({
    onBlockNumber: async (blockNumber: bigint) => {
      try{
        const confirmtions = await getTxConfirmations(txHash, blockNumber);
        socket.emit(TransactionEvents.TX_CONFIRMATIONS, confirmtions);
        
        if(confirmtions >= minConfirmations){
          unWatchBlocks();
          socket.emit(TransactionEvents.TX_CONFIRMATIONS_STATUS, true);
          //TODO: send fiat to bank account
          sendNaira();
        }
      }catch(err){
        // handles reorgs
        console.log(err.message);
        unWatchBlocks();

        if(retries >= maxRetries){
          console.log(`monitorTx_Failed: ${txHash} not found on the blockchain`)
          socket.emit(TransactionEvents.TX_CONFIRMATIONS_STATUS, false);
          return;
        }

        setTimeout(() => monitorTx(blockchainClient, socket, txHash, ++retries, sendNaira), 10000);
      }
    }
  });
}

export default monitorTx;