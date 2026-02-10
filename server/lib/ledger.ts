import crypto from "crypto";
import { Block as BlockModel } from "../db";

interface Block {
  index: number;
  timestamp: string;
  data: any;
  previousHash: string;
  hash: string;
}

export class HashChain {
  public chain: Block[];

  constructor() {
    this.chain = [];
    this.initialize();
  }

  private async initialize() {
    // Load from DB or create Genesis
    try {
      const blocks = await BlockModel.find({}).sort({ index: 1 });
      if (blocks.length > 0) {
        this.chain = blocks.map((b: any) => ({
          index: b.index,
          timestamp: b.timestamp,
          data: b.data,
          previousHash: b.previousHash,
          hash: b.hash,
        }));
      } else {
        const genesis = this.createGenesisBlock();
        await BlockModel.create(genesis);
        this.chain = [genesis];
      }
    } catch (error) {
       console.error("Failed to initialize ledger:", error);
       // Fallback to memory genesis if DB fails initially
       this.chain = [this.createGenesisBlock()];
    }
  }

  private createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: new Date().toISOString(),
      data: "Genesis Block",
      previousHash: "0",
      hash: this.calculateHash(0, "0", new Date().toISOString(), "Genesis Block"),
    };
  }

  private calculateHash(
    index: number,
    previousHash: string,
    timestamp: string,
    data: any,
  ): string {
    return crypto
      .createHash("sha256")
      .update(index + previousHash + timestamp + JSON.stringify(data))
      .digest("hex");
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public async addBlock(data: any): Promise<Block> {
    const latestBlock = this.getLatestBlock();
    const index = latestBlock.index + 1;
    const timestamp = new Date().toISOString();
    const previousHash = latestBlock.hash;
    const hash = this.calculateHash(index, previousHash, timestamp, data);

    const newBlock: Block = {
      index,
      timestamp,
      data,
      previousHash,
      hash,
    };

    this.chain.push(newBlock);
    
    // Persist to DB
    try {
        await BlockModel.create(newBlock);
    } catch (e) {
        console.error("Failed to persist block to DB", e);
    }
    
    return newBlock;
  }

  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Check if preserved hash matches calculated hash
      const recalculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data,
      );

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }

      // 2. Check if previousHash matches the hash of the previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// Singleton instance for the app
export const ledger = new HashChain();
