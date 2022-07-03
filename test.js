const ethers = require("ethers");
const { Detector } = require('./main')
const parser = new ethers.utils.Interface([
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
]);


// console.log(ethers.utils.parseTransaction(`0xf86a018301fbd08255f0943e29dd94f4a128c551cd3750284a26ace7d56b808801634577574754008026a0710d1b778c7b5ce3a9ae959a0ab273931e6a552db4e5644e267d77cb36ef48f5a02359b11f7a9486426c7e7c5c19fb33740803681804731760ae76ac0b5029ad3c`))
// console.log(parser.encodeFunctionData("claim", [
//   prof.index,
//   "0xEf0D8F546880d1D41e7F35c5BA06a43C7F42FF2f",
//   prof.amount,
//   prof.proof
// ]))
// 0x9fb036532d78b0e3ef4b649d534f1166cbd83ace;
// data =
//   "0xe985e9c5000000000000000000000000b48e45c76e7442d9944790085399e26b7d89b1ed000000000000000000000000f57501e51bbb2f23d532166429e5fae078fef6d8";

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
  }, 300000);
  await instance.init()
  const pageUrls = [
    // "https://adidas-metaverse.io/",
    // "https://theoddities.xyz/",
    // "https://claimkarafuru.xyz/",
    // "https://merch-azuki.com/",
    // "https://goblin-town.wtf/",
    // "https://colourscats.netlify.app/?utm_source=icy.tools",
    // "https://pieceofshit.wtf",
    // "http://adidas-capsule.art/",
    // "https://gobilintown.wtf/",
    // "https://burgers-goblintown.wtf/",
    // "https://goblingirlfriends.wtf",
    // "http://premint.wtf",
    // "https://claimchimpersnft.xyz",
    // "https://rektguy.art",
    // "https://piecesofshit.wtf/",
    // "https://nft-ftc.com",
    // "https://get-goblin.town/",
    // "http://WeAreAllGoingToDie.WTF",
    // "https://goblin-town.app",
    // "https://goblintown.live",
    // "https://goblintown-drop.art/",
    // "https://bokiworld.art/claim.html",
    // "https://qobllmtown.wtf",
    // "https://goblin-town.net",
    // "https://airdropit.org/wagdie.html",
    // "https://goblintown-drop.art/",
    // "https://goblin-town.net/",
    // "https://qobllmtown.wtf/",
    // "https://chimpersnft.art/",
    // "https://beginasnothing.art/",
    // "https://thegoda.live/",
    // "https://goblintownwft.xyz/",
    // "https://elftownz.wtf/",
    // "https://goblintown.gift/",
    // "https://thegoda.live",
    // "https://mintgreatgoats.com",
    // "https://innerdegens.wtf",
    // "https://macarena.finance",
    // "https://piecesofshits.wtf",
    // "https://murakamiflowers.club",
    // "https://tigerbobes.com",
    // "https://ainightblrds.com",
    // "https://nycnfts.xyz",
    // "https://premintspass.xyz",
    // "https://pieceoffshit.wtf",
    // "https://doodle2.app",
    // "https://dloodles.com",
    // "https://otherside-game.xyz",

    // "doodles2-reveal.com",
    // "dooodiles.com",
    // "goblintowm.one",
    // "thespacedoodles.app",
    // "genesisbox-doodles.app",
    // "doodles-raffle.com",
    // "ezekclub.net",
    // "game-otherside.io",
    // "moonrunnersofficial.com",
    // "doodles.plus",
    // "otherside-game.xyz",
    // "dloodles.com",
    // "goblintomwtf.com",
    // "itsnothing.art",
    // "aikosvirtual.com",
    // "game-otherside.xyz",
    // "moonrunners.live",

    // "doodle2.app",
    // "goblintown.cafe",
    // "pieceoffshit.wtf",
    // "goblintown.bz",
    // "gossamerseed.world",
    // "premintspass.xyz",
    // "goblintonwtf.com",
    // "nycnfts.xyz",
    // "goblendawn.wtf",
    // "ainightblrds.com",
    // "ninja-dao.claims",
    // "claimdoodles.app",
    // "xcubex.com",
    // "pabloslol.wtf",
    // "nft-goblin.town",
    // "goblin-town.art",
    // "goblentown.com",
    // "tigerbobes.com",
    // "murakamiflowers.club",
    // "piecesofshits.wtf",
    // "otherside-nft.app",
    // "macarena.finance",
    // "premintnfts.xyz",
    // "ninjadao-cnp-pj.com",
    // "innerdegens.wtf",
    // "otherside-metaverse.com",
    // "pieceofshits.wtf",
    // "mintgreatgoats.com",
    "goblintown.gift",
  ];

  // await detectPage("https://merch-azuki.com/");
  for (let index = 0; index < pageUrls.length; index++) {
    const url = pageUrls[index];
    const result = await instance.detectPage(`https://${url}`);
    console.log(result);
  }

}

test()


// const { lookup } = require('./whois');
// const parseRawData = require("./parsed");

// console.log(lookup);
// lookup("baidu.com", (err, whoisResult) => {
//   const res = parseRawData(whoisResult, "baidu.com");
//   console.log(res);
// });