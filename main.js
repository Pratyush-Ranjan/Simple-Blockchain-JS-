const SHA256=require('crypto-js/sha256');

class block{
	constructor(index,timestamp,data,previoushash='')
	{
		this.index=index;
		this.timestamp=timestamp;
		this.data=data;
		this.previoushash=previoushash;
		this.hash=this.calculatehash();
		this.nonce=0;
	}
	calculatehash(){
		return SHA256(this.index+this.timestamp+this.previoushash+JSON.stringify(this.data)+this.nonce).toString();
	}
	miningblock(difficulty)
	{
		while(this.hash.substring(0,difficulty)!= Array(difficulty+1).join("0"))
		{	this.nonce++;
			this.hash=this.calculatehash();
		}
		console.log("Mining block"+this.index+"mined:"+this.hash);
	}
}
class blockchain{
	constructor(){
		this.chain=[this.creategenesisblock()];
		this.difficulty=4;
	}
	creategenesisblock(){
		return new block(0,"17/05/2019",{coins: 2},"0");
	}
	getlatestblock(){
		return this.chain[this.chain.length-1];
	}
	addnewblock(newblock){
		newblock.previoushash=this.getlatestblock().hash;
		newblock.miningblock(this.difficulty);
		this.chain.push(newblock);
	}
	ischainvalid(){
		for(let i=1;i<this.chain.length;i++){
			const currentblock=this.chain[i];
			const previousblock=this.chain[i-1];
			if(currentblock.hash !== currentblock.calculatehash()){
				return false;
			}
			if(currentblock.previoushash !== previousblock.hash){
				return false;
			}
		}
		return true;
	}
}
let mychain=new blockchain;
console.log("start 1:-");
mychain.addnewblock(new block(1,Date(),{coins: 4}));
console.log("start 2:-");
mychain.addnewblock(new block(2,Date(),{coins: 10}));
setTimeout(function() {
  console.log("is my chain valid ?"+mychain.ischainvalid());
console.log(JSON.stringify(mychain,null,4));
mychain.chain[1].data={coins: 6};
console.log("is my chain valid ?"+mychain.ischainvalid());
mychain.chain[1].hash=mychain.chain[1].calculatehash();
console.log("is my chain valid ?"+mychain.ischainvalid());
console.log(JSON.stringify(mychain,null,4));
}, 2000);