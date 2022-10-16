// Import Solana web3 functinalities
const {
        Connection,
        PublicKey,
        clusterApiUrl,
        Keypair,
        LAMPORTS_PER_SOL,
        Transaction,
        SystemProgram,
        sendAndConfirmRawTransaction,
        sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
        [
                160, 20, 189, 212, 129, 188, 171, 124, 20, 179, 80,
                27, 166, 17, 179, 198, 234, 36, 113, 87, 0, 46,
                186, 250, 152, 137, 244, 15, 86, 127, 77, 97, 170,
                44, 57, 126, 115, 253, 11, 60, 90, 36, 135, 177,
                185, 231, 46, 155, 62, 164, 128, 225, 101, 79, 69,
                101, 154, 24, 58, 214, 219, 238, 149, 86
        ]
);

const getWalletBalance = async (publicKey) => {

        try {
                // Connect to the Devnet
                const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
                // console.log("Connection object is:", connection);

                // Make a wallet (keypair) from privateKey and get its balance
                // const myWallet = await Keypair.fromSecretKey(privateKey);
                const walletBalance = await connection.getBalance(
                        // new PublicKey(newPair.publicKey)
                        publicKey
                );
                // console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
                return (parseInt(walletBalance) / LAMPORTS_PER_SOL);
        } catch (err) {
                console.log(err);
        }
}
const transferSol = async () => {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Get Keypair from Secret Key
        var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

        // Other things to try: 
        // 1) Form array from userSecretKey
        // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
        // 2) Make a new Keypair (starts with 0 SOL)
        // const from = Keypair.generate();

        // Generate another Keypair (account we'll be sending to)
        const to = Keypair.generate();

        // Aidrop 2 SOL to Sender wallet
        console.log("Airdopping some SOL to Sender wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(from.publicKey),
                2 * LAMPORTS_PER_SOL
        );
        let senderBal = await getWalletBalance(from.publicKey);
        console.log("Sender Bal Bef: ", senderBal);

        let receiverBal = await getWalletBalance(to.publicKey);
        console.log("Receiver Balance before tx:", receiverBal);

        // Latest blockhash (unique identifer of the block) of the cluster
        let latestBlockHash = await connection.getLatestBlockhash();

        // Confirm transaction using the last valid block height (refers to its time)
        // to check for transaction expiration ( a safer way by proof of history)
        await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: fromAirDropSignature
        });

        let amountToSend = parseInt((senderBal) * 0.5 * LAMPORTS_PER_SOL);
        // Send money from "from" wallet and into "to" wallet
        var transaction = new Transaction().add(
                SystemProgram.transfer({
                        fromPubkey: from.publicKey,
                        toPubkey: to.publicKey,
                        lamports: amountToSend,
                })
        );

        // Sign transaction
        var signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [from]
        );
        console.log('Signature is ', signature);
        senderBal = await getWalletBalance(from.publicKey);
        console.log("Sender Bal after Tx: ", senderBal);

        receiverBal = await getWalletBalance(to.publicKey);
        console.log("Receiver Balance after tx:", receiverBal);
}

transferSol();

