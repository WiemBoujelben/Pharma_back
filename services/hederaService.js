import { Client, AccountId, PrivateKey, ContractExecuteTransaction, ContractFunctionParameters,ContractCallQuery } from "@hashgraph/sdk";
import dotenv from "dotenv"; // Use ES module import for dotenv

dotenv.config(); // Load environment variables
const client = Client.forTestnet();
client.setOperator(AccountId.fromString("0.0.5200141"), PrivateKey.fromString("3030020100300706052b8104000a04220420fe037d98ddd079acce21d18abb39d9e3f648b53ebf6f0e71ecaecdf30eb11a77"));

const contractId = process.env.CONTRACT_ID;
// Generate unsigned transaction


const isUserRegistered = async (wallet) => {
  try {
      console.log("Checking if user is registered in smart contract:", wallet);

      // Create a query to call the isUserRegistered function
      const query = new ContractCallQuery()
          .setContractId(contractId) // Set the contract ID
          .setGas(100000) // Set gas limit
          .setFunction(
              "isUserRegistered", // Function name
              new ContractFunctionParameters().addAddress(wallet) // Function parameters
          );

      // Execute the query
      const tx = await query.execute(client);

      // Get the result (boolean)
      const result = tx.getBool(0); // Assuming the function returns a boolean
      console.log("User registration status:", result);

      return result; // Return the result (true or false)
  } catch (err) {
      console.error("Error checking user registration:", err);
      throw err;
  }
};
const approveUser = async (wallet) => {
  try {
      console.log("Approving user in smart contract:", wallet);

      // Check if user is registered
      const isRegistered = await isUserRegistered(wallet);
      if (!isRegistered) {
          throw new Error("Wallet is not registered in the smart contract");
      }

      // Proceed with approval
      const tx = await new ContractExecuteTransaction()
          .setContractId(contractId)
          .setGas(200000)
          .setFunction("approveUser", new ContractFunctionParameters().addAddress(wallet))
          .execute(client);

      const receipt = await tx.getReceipt(client);
      console.log("Transaction receipt:", receipt.status.toString());

      if (receipt.status.toString() === "CONTRACT_REVERT_EXECUTED") {
          throw new Error("Smart contract reverted the transaction. Check contract conditions.");
      }

      // Generate HashScan link
      const transactionId = tx.transactionId.toString();
      const hashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;

      return {
          status: receipt.status.toString(),
          transactionId,
          hashScanLink,
      };
  } catch (err) {
      console.error("Error approving user:", err);
      throw err;
  }
};


export default { approveUser,isUserRegistered};