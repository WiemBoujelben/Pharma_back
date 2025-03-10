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
        const query = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("isUserRegistered", new ContractFunctionParameters().addAddress(wallet));

        const tx = await query.execute(client);
        const result = tx.getBool(0); // Assuming the function returns a boolean
        console.log("User registration status:", result);
        return result;
    } catch (err) {
        console.error("Error checking user registration:", err);
        throw err;
    }
};
const approveUser = async (wallet) => {
    try {
      console.log("Approving user in smart contract:", wallet);
      const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("approveUser", new ContractFunctionParameters().addAddress(wallet))
        .execute(client);
  
      const receipt = await tx.getReceipt(client);
      console.log("Transaction receipt:", receipt.status.toString());
  
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
const registerUser = async (wallet, role) => {
    try {
      console.log("Registering user in smart contract:", wallet, "Role:", role);
      const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
          "registerUser",
          new ContractFunctionParameters()
            .addAddress(wallet) // Wallet address
            .addUint8(role) // User role (e.g., 1 for Manufacturer, 2 for Distributor, etc.)
        )
        .execute(client);
  
      const receipt = await tx.getReceipt(client);
      console.log("Transaction receipt:", receipt.status.toString());
  
      // Generate HashScan link
      const transactionId = tx.transactionId.toString();
      const hashScanLink = `https://hashscan.io/testnet/transaction/${transactionId}`;
  
      return {
        status: receipt.status.toString(),
        transactionId,
        hashScanLink,
      };
    } catch (err) {
      console.error("Error registering user:", err);
      throw err;
    }
  };

export default { approveUser,registerUser,isUserRegistered};