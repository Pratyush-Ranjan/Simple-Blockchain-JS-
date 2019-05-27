const SHA256=require('crypto-js/sha256');
const EC =require("elliptic").ec;
const ec=new EC('secp256k1');
class Transactions {
	constructor(fromaddr,toaddr,amount)
	{
		this.fromaddr=fromaddr;
		this.toaddr=toaddr;
		this.amount=amount;
	}
	Calculatehash()
	{
		return SHA256(this.fromaddr+this.toaddr+this.amount).toString();
	}
	signtransaction(signingkey)
	{
		if(signingkey.getPublic('hex')!==this.fromaddr)
			throw new Error("you cannot sign transaction for any other wallet");
		const hastx=this.Calculatehash();
		const sig=signingkey.sign(hastx, 'base64');
		this.signature=sig.toDER('hex');
	}
	isvalid()
	{
		if(this.fromaddr===null)return true;
		if(!this.signature||this.signature.length===0)
			throw new Error("no sign in this transaction");
		const publickey=ec.keyFromPublic(this.fromaddr,'hex');
		return publickey.verify(this.Calculatehash(),this.signature);
	}
}
class block{
	constructor(timestamp,transactions,previoushash='')
	{
		this.timestamp=timestamp;
		this.transactions=transactions;
		this.previoushash=previoushash;
		this.hash=this.calculatehash();
		this.nonce=0;
	}
	calculatehash(){
		return SHA256(this.timestamp+this.previoushash+JSON.stringify(this.transactions)+this.nonce).toString();
	}
	transvalid(){
		for(const tx of this.transactions)
		{
			if(!tx.isvalid())
				return false;
		}
		return true;
	}
	miningblock(difficulty)
	{
		while(this.hash.substring(0,difficulty)!= Array(difficulty+1).join("0"))
		{	this.nonce++;
			this.hash=this.calculatehash();
		}
	}
}
class blockchain{
	constructor(){
		this.chain=[this.creategenesisblock()];
		this.difficulty=2;
		this.pendingtransactions=[];
		this.minerrewards=100;
	}
	creategenesisblock(){
		return new block(Date(),[],"0");
	}
	getlatestblock(){
		return this.chain[this.chain.length-1];
	}
	addpendingtransactions(miningaddrreward){
		let addblock=new block(Date(),this.pendingtransactions);
		addblock.previoushash=this.getlatestblock().hash;
		addblock.miningblock(this.difficulty);
		this.chain.push(addblock);
		this.pendingtransactions=[
		new Transactions(null,miningaddrreward,this.minerrewards)];
	}
	addtransaction(transactions)
	{
		if(!transactions.fromaddr|| !transactions.toaddr)
			throw new Error("add from and to address in transaction");
		if(!transactions.isvalid())
			throw new Error("transaction is not valid");
		this.pendingtransactions.push(transactions);
	}
	getbalanceaddressof(address)
	{
		let balance=0;
		for(const block of this.chain)
		{
			for(const trans of block.transactions)
			{
				if(trans.fromaddr===address)
					balance-=trans.amount;
				else if(trans.toaddr===address)
					balance+=trans.amount;
			}
		}
		return balance;
	}
	ischainvalid(){
		for(let i=1;i<this.chain.length;i++){
			const currentblock=this.chain[i];
			const previousblock=this.chain[i-1];
			if(!currentblock.transvalid())
				return false;
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
module.exports.blockchain=blockchain;
module.exports.Transactions=Transactions;