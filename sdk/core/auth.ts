/**
 * Authentication and wallet management
 */

import { ethers } from "ethers";
import { SDKConfig } from "../types";
import { getNetworkConfig } from "../config/networks";

export class Auth {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private network: string;

  constructor(config: SDKConfig) {
    this.network = config.network;
    const networkConfig = getNetworkConfig(config.network);

    // Initialize provider
    if (config.provider) {
      this.provider = config.provider;
    } else if (config.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    } else {
      this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    }

    // Initialize signer
    if (config.signer) {
      this.signer = config.signer;
    } else if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  /**
   * Get the current provider
   */
  getProvider(): ethers.Provider {
    return this.provider;
  }

  /**
   * Get the current signer
   */
  getSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error("No signer configured. Please provide a private key or signer.");
    }
    return this.signer;
  }

  /**
   * Get the address of the current signer
   */
  async getAddress(): Promise<string> {
    const signer = this.getSigner();
    return await signer.getAddress();
  }

  /**
   * Get the balance of an address
   */
  async getBalance(address?: string): Promise<string> {
    const addr = address || (await this.getAddress());
    const balance = await this.provider.getBalance(addr);
    return ethers.formatEther(balance);
  }

  /**
   * Check if the wallet is connected
   */
  isConnected(): boolean {
    return !!this.signer;
  }

  /**
   * Connect with a browser wallet (MetaMask, etc.)
   */
  async connectBrowserWallet(): Promise<string> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No browser wallet detected");
    }

    const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    await browserProvider.send("eth_requestAccounts", []);
    
    this.signer = await browserProvider.getSigner();
    return await this.getAddress();
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    const signer = this.getSigner();
    return await signer.signMessage(message);
  }

  /**
   * Verify a signed message
   */
  verifyMessage(message: string, signature: string): string {
    return ethers.verifyMessage(message, signature);
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return getNetworkConfig(this.network);
  }
}
