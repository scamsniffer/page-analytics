const log = console.log;
const mock_address = "0xef0d8f546880d1d41e7f35c5ba06a43c7f42ff2f";
const mock_chain = "0x1";

var ethereum = {
  isMetaMask: true,
  chainId: mock_chain,
  autoRefreshOnNetworkChange: false,
  networkVersion: mock_chain,
  selectedAddress: mock_address,
  async enable() {
    return [mock_address];
  },
  _metamask: {
    async isUnlocked() {
      return false;
    },
    async requestBatch(requests) {
      console.log(requests);
    },
  },
  isConnected: function () {
    log("isConnected");
    return true;
  },
  on: function (type, cb) {
    log("on", type, cb);
    sendLog("listen", type);
    if (type === "connect") {
      // cb({
      //   chainId: mock_chain
      // });
    }
    if (type === "chainChanged") {
      // cb(mock_chain);
    }
    if (type === "accountsChanged") {
      // cb([mock_address]);
    }
  },
  request: async function (args) {
    log("request", args.method, args.params ? args.params[0] : null);
    sendLog("request", args, { mock_address });
    if (args.method === "eth_accounts") {
      return [mock_address];
    }
    if (args.method === "eth_requestAccounts") {
      return [mock_address];
    }
    if (args.method === "eth_chainId") {
      return mock_chain;
    }

    // if (args.method === "message") {

    // }

    if (args.method === "wallet_switchEthereumChain") {
      return true;
    }

    if (args.method === "eth_blockNumber") {
      return 10000000 + Math.floor(Math.random() * 10000000000);
    }
    if (args.method === "eth_estimateGas") {
      return 100000;
    }

    if (args.method === "eth_sendTransaction") {
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
      throw new Error("failed");
    }

    if (args.method === "eth_getBalance") {
      return "100000000000000000";
    }
    if (args.method === "eth_getBlockByNumber") {
      return {
        gasLimit: "0x100000000",
      };
    }
  },
};

// var window = {};
window.ethereum = new Proxy(ethereum, {
  get: function (target, key, receiver) {
    console.log("window.get.key: ", key);
    if (target[key] instanceof Object) {
      return new Proxy(target[key], {
        get: function (a, b, c) {
          console.log("window.get.instance.key: ", key, b);
          return a[b];
        },
        set: function (a, b, c, d) {
          console.log("window.set.instance.key: ", a, b, c);
          a[b] = c;
        },
      });
    }

    return target[key];
  },
  set: function (target, key, value, receiver) {
    console.log("window.set.key: ", target, key, value);
    try {
      target[key] = value;
      return true
    } catch (e) {
      console.log("error", e);
      return false
    }
  },
});

let onOneMatch = false;

function clickBtnByText(names = ["connect"]) {
  let matched = 0;
  let btns = Array.from(document.querySelectorAll("button")).concat(
    document.querySelectorAll(".web3modal-provider-container")
  );
  let isLink = false;
  if (!btns.length) {
    btns = Array.from(document.querySelectorAll("a"));
    isLink = true;
  }

  if (btns.length) {
    for (let index = 0; index < btns.length; index++) {
      const btn = btns[index];

      if (isLink) {
        if (btn.getAttribute("href") != null) {
          continue;
        }
      }
      const isMatch = names.find(
        (name) =>
          btn.innerText && btn.innerText.toLowerCase().indexOf(name) > -1
      );
      if (isMatch) {
        matched++;
        sendLog("click btn", name);
        setTimeout(() => {
          btn.click();
        });
      }
    }
    if (matched === 0) {
      setTimeout(() => {
        btns[0].click();
      });
    }
  } else {
    sendLog("btn not found", name);
  }
}

window.onload = () => {
  sendLog("autoConnect");
  clickBtnByText(["connect", "get", "mint"]);
  setTimeout(() => {
    clickBtnByText(["claim", "connect", "metamask"]);
  }, 1000);
};
