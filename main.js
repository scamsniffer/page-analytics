const puppeteer = require("puppeteer");
const fs = require("fs");
const ethers = require("ethers");

const parser = new ethers.utils.Interface([
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
]);

const targetAddress = {
  setApprovalForAll: "operator",
  safeTransferFrom: "to",
  transferFrom: "to",
};

class Detector {
  constructor(
    opts = {
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
      // executablePath: "/usr/bin/google-chrome",
      // headless: false,
    },
    timeout = 35
  ) {
    this.opts = opts;
    this.browser = null;
    this.timeout = timeout;
  }

  async init() {
    if (this.browser) return;
    this.running = 0;
    this.browser = await puppeteer.launch(this.opts);
  }

  async detectPage(pageUrl) {
    if (this.running > 5)
      return {
        error: "reach limit",
      };
    this.running++;
    const page = await this.browser.newPage();

    let doneLock = null,
      waitTimer = null;

    const pageActions = [];
    const hackerAddress = new Set();
    const uniqueActions = new Set();
    const requests = [];
    const methods = new Set();
    const keys = new Set();

    let activeTime = Date.now();

    function allDone() {
      doneLock && doneLock();
      waitTimer && clearTimeout(waitTimer);
    }
    let startTime = Date.now();
    await page.exposeFunction("sendLog", (arg1, arg2, config) => {
      activeTime = Date.now();
      console.log(arg1, arg2, {
        lifetime: Date.now() - startTime,
      });
      if (arg1 === "request") {
        methods.add(arg2.method);
        if (
          ["eth_sendTransaction", "eth_estimateGas"].indexOf(arg2.method) > -1
        ) {
          const transaction = arg2.params[0];
          console.log(transaction);
          try {
            const decodedInput = parser.parseTransaction({
              data: transaction.data,
              value: transaction.value,
            });

            if (decodedInput.name) {
              const action = {
                name: decodedInput.name,
                signature: decodedInput.signature,
                args: decodedInput.args,
              };
              pageActions.push(action);
              const mapping = targetAddress[decodedInput.name];
              if (mapping) {
                hackerAddress.add(decodedInput.args[mapping]);
              }
              uniqueActions.add(decodedInput.name);
              console.log(action);
              if (pageActions.length) allDone();
            }
            // const argsAddr = decodedInput.args[targetAddress[decodedInput.name]]
          } catch (e) {
            console.log("parse failed", e);
          }
        }
      }
    });

    page.on("response", async (response) => {
      let request = response.request();
      const headers = response.headers();
      const isJson = headers["content-type"] === "application/json";
      if (isJson) {
        try {
          const url = request.url();
          const request_headers = request.headers();
          let content = await response.json();
          requests.push({
            url,
            content,
            remoteAddress: response.remoteAddress(),
          });
          if (url.indexOf("api.opensea.io") > -1) {
            keys.add(request_headers["x-api-key"]);
          }
          // console.log("Response: " + request.url(), response.remoteAddress);
          // let content = await response.text();
          // console.log("Response: " + request.url(), content);
        } catch (e) {}
      } else {
          // console.log("Response: " + request.url(), headers["content-type"]);
      }
    });

    page.on("request", (request) => {
      // console.log("request", request.url());
    });

    const preloadFile = fs.readFileSync("./metamask.js", "utf8");
    await page.evaluateOnNewDocument(preloadFile);
    try {
      await page.goto(pageUrl, {
        waitUntil: "networkidle2",
      });
    } catch (e) {
      // console.log('error', e)
      await page.close();
      this.running--;
      return {
        error: e.toString(),
      };
    }

    let isClosed = false;

    page.on("close", () => {
      console.log("page closed");
      isClosed = true;
      allDone();
    });

    const idleThreshold = 8 * 1000;
    console.log("listen idle");
    (function activeWatch() {
      const interval = Date.now() - activeTime;
      // console.log(interval);
      if (interval > idleThreshold && doneLock) {
        console.log("close", doneLock);
        allDone();
        return;
      }
      setTimeout(activeWatch, 800);
    })();

    await new Promise((resolve) => {
      console.log("wait");
      doneLock = resolve;
      waitTimer = setTimeout(resolve, this.timeout * 1000);
    });

    if (!isClosed) {
      this.running--;
      await page.close();
    }
    // await browser.close();

    return {
      spend: Date.now() - startTime,
      pageUrl,
      methods: Array.from(methods),
      requests,
      keys: Array.from(keys),
      uniqueActions: Array.from(uniqueActions),
      hackerAddress: Array.from(hackerAddress),
    };
  }

  async close() {
    await this.browser.close();
  }
}

// async function detectPage(pageUrl) {
//   const page = await browser.newPage();
  
// }


module.exports = {
  Detector,
};

async function test() {
  //   const pageUrl = "https://adidas-metaverse.io/";
  // const pageUrl = "https://theoddities.xyz/";
  // const pageUrl = "https://claimkarafuru.xyz/";
  // const pageUrl = "https://merch-azuki.com/";
  const instance = new Detector();
  await instance.init()
  const pageUrls = [
    // "https://adidas-metaverse.io/",
    // "https://theoddities.xyz/",
    // "https://claimkarafuru.xyz/",
    // "https://merch-azuki.com/",
    // "https://goblin-town.wtf/",
    // "https://colourscats.netlify.app/?utm_source=icy.tools",
    "https://boki.gift",
  ];

  // await detectPage("https://merch-azuki.com/");
  // return

  for (let index = 0; index < pageUrls.length; index++) {
    const pageUrl = pageUrls[index];
    const result = await instance.detectPage(pageUrl);
    // console.log(result);
    fs.appendFileSync("./data.json", ','+JSON.stringify(result, null, 2));
  }
}

// test()
