const puppeteer = require("puppeteer");
const fs = require("fs");
const ethers = require("ethers");
const version = "0.0.3";
const parser = new ethers.utils.Interface([
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  // "function approve(address to, uint256 tokenId)",
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
    const allRequests = [];
    const methods = new Set();
    const keys = new Set();

    let activeTime = Date.now();
    let closeReason = null;

    function allDone(type = "unknown") {
      closeReason = type;
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
          [
            "eth_sendTransaction",
            "eth_estimateGas",
            "eth_sendRawTransaction",
          ].indexOf(arg2.method) > -1
        ) {
          const isRaw = arg2.method === "eth_sendRawTransaction";
          console.log("isRaw", isRaw);
          const transaction = isRaw
            ? ethers.utils.parseTransaction(arg2.params[0])
            : arg2.params[0];
          console.log(transaction);
          try {
            const dataEmpty =
              !transaction.data ||
              (transaction.data && transaction.data === "0x");
            if (dataEmpty && transaction.value) {
              uniqueActions.add("transferETH");
              hackerAddress.add(transaction.to);
              pageActions.push({
                name: "transferETH",
                args: transaction,
              });
            } else {
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
              }
            }
            if (pageActions.length) {
              setTimeout(() => {
                allDone("hasPageAction");
              }, 1000);
            }
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
          let content = await response.text();
          requests.push({
            url,
            content:
              content.length > 1000
                ? JSON.stringify([content.slice(0, 500)])
                : JSON.parse(content),
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

      allRequests.push({
        url: request.url(),
      });
    });

    page.on("request", (request) => {
      // console.log("request", request.url());
    });

    let screenshot = null, pageContent = null, pageTitle = null;
    const preloadFile = fs.readFileSync("./metamask.js", "utf8");
    await page.evaluateOnNewDocument(preloadFile);
    let isClosed = false;
    try {
      await page.goto(pageUrl, {
        waitUntil: "networkidle2",
      });
    } catch (e) {
      isClosed = true;
      console.log('error', e)
      screenshot = await page.screenshot({ encoding: "base64" });
      pageContent = await page.content();
      pageTitle = await page.title();
      await page.close();
      this.running--;
      // return {
      //   error: e.toString(),
      // };
    }

    if (!isClosed) {
      page.on("close", () => {
        if (isClosed) return;
        isClosed = true;
        allDone("pageClosed");
      });

      const idleThreshold = 15 * 1000;
      (function activeWatch() {
        const interval = Date.now() - activeTime;
        // console.log(interval);
        if (interval > idleThreshold && doneLock) {
          // console.log("close", doneLock);
          allDone("idleReach");
          return;
        }
        setTimeout(activeWatch, 800);
      })();

      await new Promise((resolve) => {
        console.log("wait");
        doneLock = resolve;
        waitTimer = setTimeout(() => {
          allDone("reachTimeOut");
        }, this.timeout * 1000);
      });

      if (!isClosed) {
        this.running--;
        isClosed = true;
        screenshot = await page.screenshot({ encoding: "base64" });
        pageContent = await page.content();
        pageTitle = await page.title();
        await page.close();
      }
      // await browser.close();
    }
    return {
      version,
      closeReason,
      spend: Date.now() - startTime,
      pageUrl,
      methods: Array.from(methods),
      requests,
      keys: Array.from(keys),
      allRequests,
      pageActions,
      // screenshot,
      pageTitle,
      pageContent,
      uniqueActions: Array.from(uniqueActions),
      hackerAddress: Array.from(hackerAddress),
    };
  }

  async close() {
    await this.browser.close()
    this.browser = null
    this.running = 0;
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
  await instance.init();
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
    fs.appendFileSync("./data.json", "," + JSON.stringify(result, null, 2));
  }
}

// test()
