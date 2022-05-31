const ethers = require("ethers");
const { Detector } = require('./main')
// const parser = new ethers.utils.Interface([
//   "function setApprovalForAll(address operator, bool approved)",
//   "function transferFrom(address from, address to, uint256 tokenId)",
//   "function safeTransferFrom(address from, address to, uint256 tokenId)",
// ]);
// 0x9fb036532d78b0e3ef4b649d534f1166cbd83ace;
// data =
//   "0xa22cb4650000000000000000000000009fb036532d78b0e3ef4b649d534f1166cbd83ace0000000000000000000000000000000000000000000000000000000000000001";

// console.log(
//   parser.parseTransaction({
//     data: data,
//     value: null,
//   })
// );


async function test() {
  //   const pageUrl = "https://adidas-metaverse.io/";
  // const pageUrl = "https://theoddities.xyz/";
  // const pageUrl = "https://claimkarafuru.xyz/";
  // const pageUrl = "https://merch-azuki.com/";
  const instance = new Detector({
    headless: false,
  }, 100000);
  await instance.init()
  const pageUrls = [
    // "https://adidas-metaverse.io/",
    // "https://theoddities.xyz/",
    // "https://claimkarafuru.xyz/",
    // "https://merch-azuki.com/",
    // "https://goblin-town.wtf/",
    // "https://colourscats.netlify.app/?utm_source=icy.tools",
    "https://osf-nft.art/",
  ];

  // await detectPage("https://merch-azuki.com/");
 const result = await instance.detectPage(pageUrls[0]);
 console.log(result);
}

test()
