const{blockchain,Transactions}=require("./blockchain");
const EC =require("elliptic").ec;
const ec=new EC('secp256k1');

const mykey=ec.keyFromPrivate("fc4ff4efcfb154d06b64c0835dc8d87d79ecc6838f290186f51382e0075ca502");
const mywalletaddr=mykey.getPublic('hex');
let mychain=new blockchain;
const tran=new Transactions(mywalletaddr,"public address whom to send goes here",10);
tran.signtransaction(mykey);
mychain.addtransaction(tran);
mychain.addpendingtransactions(mywalletaddr);
mychain.addpendingtransactions(mywalletaddr);
console.log("Balance of my address:-"+mychain.getbalanceaddressof(mywalletaddr));
console.log("is my chain valid? "+mychain.ischainvalid());
console.log(JSON.stringify(mychain,null,4));
mychain.chain[1].transactions[0].amount=1;
console.log("is my chain valid? "+mychain.ischainvalid());
