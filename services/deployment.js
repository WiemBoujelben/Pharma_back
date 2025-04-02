import { Client, ContractCreateFlow, PrivateKey, Hbar } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();


// Set up Hedera client
const operatorId = "0.0.5200141";
const operatorKey = PrivateKey.fromStringECDSA("3030020100300706052b8104000a04220420fe037d98ddd079acce21d18abb39d9e3f648b53ebf6f0e71ecaecdf30eb11a77");
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Contract bytecode (replace with your compiled bytecode)
const bytecode = "bytecode_iciiii";

// Deploy the contract
async function deployContract() {
    try {
        const contractCreate = new ContractCreateFlow()
            .setBytecode(bytecode) // Set contract bytecode
            .setGas(1_000_000); // Set gas limit

        // Sign and execute the transaction
        const txResponse = await contractCreate.execute(client);
        const receipt = await txResponse.getReceipt(client);
        const contractId = receipt.contractId;

        console.log("Contract deployed with ID:", contractId.toString());
        return contractId;
    } catch (error) {
        console.error("Error deploying contract:", error);
        process.exit(1);
    }
}

deployContract();