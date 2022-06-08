const ethers = require("ethers");
const { Detector } = require('./main')
const parser = new ethers.utils.Interface([
  "function claim(uint256 index, address account, uint256 amount, bytes32[] merkleProof)",
]);

const user = "0xEf0D8F546880d1D41e7F35c5BA06a43C7F42FF2f";

async function getProof(address) {
  const req = await fetch(
    `https://cors.r2d2.to/?https://gateway-backend-mainnet.optimism.io/proof/${address}`
  );
  const data = await req.json()
  return data;
}

async function genInput(address) {
  const proof = await getProof(address)
  return parser.encodeFunctionData("claim", [
    proof.index,
    address,
    proof.amount,
    proof.proof,
  ]);
}

// console.log(parser.encodeFunctionData("claim", [
//   prof.index,
//   "0xEf0D8F546880d1D41e7F35c5BA06a43C7F42FF2f",
//   prof.amount,
//   prof.proof
// ]))
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

// test()


const { lookup } = require('./whois');

console.log(lookup);
lookup('baidu.com', (err, data) => {
  console.log(err, data)
})