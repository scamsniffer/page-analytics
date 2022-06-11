const log = console.log;
const mock_lists = [
  // "0x94be0efdc095191070d360a5AA068764810a8da5",
  "0xB48e45c76E7442D9944790085399E26b7d89b1Ed",
  "0xAFD2C82D0768A13d125ca5DA0695263840E68807",
  "0x4C3A9E512c1B503cCE5Fe3d3838bc7964c35F5a1",
  "0x93e11C24e93C98b56674CFd98A43272fDFFf5F63",
  // "0xc65E1E42D736fD645Bb28461C479b84be0445744",
];

const mock_address = mock_lists[Math.floor(Math.random() * mock_lists.length)];
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
      log(requests);
    },
  },
  isConnected: function () {
    log("isConnected");
    return true;
  },
  async send(args, callBack) {
    log("send", args, callBack);
    sendLog("send", args, callBack);
    const result = {
      id: args.id,
      jsonrpc: args.jsonrpc,
      result: await this.request(args),
    };
    callBack && callBack(null, result);
  },
  async sendAsync(args, callBack) {
    log("sendAsync", args, callBack);
    sendLog("sendAsync", args, callBack);
    const result = {
      id: args.id,
      jsonrpc: args.jsonrpc,
      result: await this.request(args),
    };
    callBack && callBack(null, result);
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

    if (args.method === "eth_getTransactionCount") {
      return 1;
    }

    if (args.method === "eth_gasPrice") {
      return '100000'
    }

    if (args.method === "eth_sign" || args.method === "personal_sign") {
      return "0x710d1b778c7b5ce3a9ae959a0ab273931e6a552db4e5644e267d77cb36ef48f52359b11f7a9486426c7e7c5c19fb33740803681804731760ae76ac0b5029ad3c1c";
    }

    if (args.method === "personal_ecRecover") {
      return mock_address
    }

      if (args.method === "eth_requestAccounts") {
        return [mock_address];
      }
    if (args.method === "eth_chainId") {
      return mock_chain;
    }

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
    log("window.get.key: ", key);
    sendLog("window.get.key: ", key);
    if (target[key] instanceof Object) {
      return new Proxy(target[key], {
        get: function (a, b, c) {
          log("window.get.instance.key: ", key, b);
          sendLog("window.get.instance.key: ", key, b);
          return a[b];
        },
        set: function (a, b, c, d) {
          log("window.set.instance.key: ", a, b, c);
          sendLog("window.set.instance.key: ", a, b, c);
          a[b] = c;
        },
      });
    }

    return target[key];
  },
  set: function (target, key, value, receiver) {
    log("window.set.key: ", target, key, value);
    sendLog("window.set.key: ", target, key, value);
    try {
      target[key] = value;
      return true
    } catch (e) {
      log("error", e);
      return false
    }
  },
});

let onOneMatch = false;
let clicked = false

function clickBtnByText(names = ["connect"], connect = false) {
  let matched = 0;
  let clickableNodes = Array.from(
    Array.from(document.querySelectorAll("button"))
      .concat(
        Array.from(document.querySelectorAll(".web3modal-provider-container")),
        Array.from(document.querySelectorAll("a")),
        Array.from(document.querySelectorAll("div")).filter(
          (_) => _.innerText.trim().indexOf("Connect") > -1
        )
      )
      .reduce((all, el) => all.add(el), new Set())
  ).filter(_ => {
    const isDIV = _.tagName === 'DIV';
    if (isDIV) {
      let styles = window.getComputedStyle(_)
      if (styles['cursor'].toLowerCase() === 'pointer') {
        return true
      } else {
        return false;
      }
    }
    if (_.tagName === "A") {
      if (_.host && _.host != window.location.host) return false;
    }
    const isMatch = names.find(
      (name) => _.innerText && _.innerText.toLowerCase().split(" ").indexOf(name) > -1
    );
    // sendLog(_.innerText);
    if (isMatch) return true;
    return false;
  });

  if (clickableNodes.length === 0) {
    Array.from(document.querySelectorAll("button")).forEach(_ => {
      clickableNodes.push(_)
    });
  }

  // auto check
  Array.from(document.querySelectorAll("input[type=checkbox]")).forEach(
    (_) => {
      _.checked = true
    }
  );
  let isLink = false;
  let connectButtons = clickableNodes.filter((_) =>
    _.innerText.toLowerCase().split(" ").indexOf('connect')
  );

  if (connectButtons.length && connect) {
    sendLog(`connectButtons: ${connectButtons.length}`);
    // clickableNodes = connectButtons;
  }

  sendLog(`clickableNodes: ${clickableNodes.length}, isLink: ${isLink}`);
  if (clickableNodes.length) {
    for (let index = 0; index < clickableNodes.length; index++) {
      const btn = clickableNodes[index];
      sendLog("click btn " + btn.innerText);
      setTimeout(() => {
        btn.click();
        clicked = true;
        sendLog("clicked");
      });
    }
  } else {
    sendLog("btn not found", name);
  }
}

async function monkeyTest() {
  sendLog('wait loading')
  for (let index = 0; index < 100; index++) {
    const isLoading = document.title.indexOf("Just a moment") > -1;
    if (!isLoading) {
      break;
    }
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 800)
    })
  }

  sendLog('try click')
  // // auto check
  // Array.from(document.querySelectorAll("input[type=checkbox]")).map(
  //   (_) => (_.checked = true)

  sendLog("autoConnect");
  clickBtnByText(["connect", "get", "mint", "i understand"], true);
  if (!clicked) {
    // log('no one')
  }
  setTimeout(() => {
    clickBtnByText(["claim", "mint", "connect", "metamask"]);
  }, 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
    for (let index = 0; index < 10; index++) {
      await monkeyTest();
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      })
    }
});
