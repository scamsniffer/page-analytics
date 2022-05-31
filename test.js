
const ethers = require("ethers");

const parser = new ethers.utils.Interface([
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
]);


// 0x9fb036532d78b0e3ef4b649d534f1166cbd83ace;

data  = '0xa22cb4650000000000000000000000009fb036532d78b0e3ef4b649d534f1166cbd83ace0000000000000000000000000000000000000000000000000000000000000001'

console.log( parser.parseTransaction({
            data: data,
            value: null
          })
);