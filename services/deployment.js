import { Client, ContractCreateFlow, PrivateKey, Hbar } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();


// Set up Hedera client
const operatorId = "0.0.5200141";
const operatorKey = PrivateKey.fromStringECDSA("3030020100300706052b8104000a04220420fe037d98ddd079acce21d18abb39d9e3f648b53ebf6f0e71ecaecdf30eb11a77");
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Contract bytecode (replace with your compiled bytecode)
const bytecode = "6080604052348015600e575f80fd5b506101438061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c80632e64cec1146100385780636057361d14610056575b5f80fd5b610040610072565b60405161004d919061009b565b60405180910390f35b610070600480360381019061006b91906100e2565b61007a565b005b5f8054905090565b805f8190555050565b5f819050919050565b61009581610083565b82525050565b5f6020820190506100ae5f83018461008c565b92915050565b5f80fd5b6100c181610083565b81146100cb575f80fd5b50565b5f813590506100dc816100b8565b92915050565b5f602082840312156100f7576100f66100b4565b5b5f610104848285016100ce565b9150509291505056fea26469706673582212209a0dd35336aff1eb3eeb11db76aa60a1427a12c1b92f945ea8c8d1dfa337cf2264736f6c634300081a0033";

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