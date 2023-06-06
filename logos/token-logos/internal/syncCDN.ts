import "dotenv/config";
import * as fs from "fs";
import path from "path";
import { ChainId } from "@sushiswap/chain";
import * as cloudinary from "cloudinary";

const BASE_DIR = "https://cdn.sushi.com/image/upload";

const NETWORK_TO_CHAIN_ID: Record<string, ChainId | 43113 | 108> = {
  arbitrum: ChainId.ARBITRUM,
  "arbitrum-nova": ChainId.ARBITRUM_NOVA,
  avalanche: ChainId.AVALANCHE,
  binance: ChainId.BSC,
  boba: ChainId.BOBA,
  "boba-avax": ChainId.BOBA_AVAX,
  bsc: ChainId.BSC,
  bttc: ChainId.BTTC,
  celo: ChainId.CELO,
  ethereum: ChainId.ETHEREUM,
  fantom: ChainId.FANTOM,
  fuji: 108,
  fuse: ChainId.FUSE,
  gnosis: ChainId.GNOSIS,
  harmony: ChainId.HARMONY,
  heco: ChainId.HECO,
  kava: ChainId.KAVA,
  matic: ChainId.POLYGON,
  metis: ChainId.METIS,
  moonriver: ChainId.MOONRIVER,
  okex: ChainId.OKEX,
  optimism: ChainId.OPTIMISM,
  palm: ChainId.PALM,
  polygon: ChainId.POLYGON,
  telos: ChainId.TELOS,
  thundercore: 108,
  xdai: ChainId.GNOSIS,
};

syncCDN();

async function syncCDN() {
  const dir = path.join(__dirname, "../network/");
  const networks = await fs.promises.readdir(dir);

  for (const network of networks) {
    if (network in NETWORK_TO_CHAIN_ID) {
      const networkPath = path.join(dir, network);
      const logos = await fs.promises.readdir(networkPath);
      await syncLogosForNetwork(
        NETWORK_TO_CHAIN_ID[network],
        networkPath,
        logos
      );
    } else {
      console.log("Unknown network", network);
    }
  }
}

async function syncLogosForNetwork(
  chainId: number,
  dir: string,
  files: string[]
) {
  console.log("Syncing chainId", chainId);
  for (const file of files) {
    let cdnFileResponse: Response;
    try {
      cdnFileResponse = await fetch(`${BASE_DIR}/tokens/${chainId}/${file}`);
    } catch (e) {
      console.log(
        "Error fetching logo",
        `${BASE_DIR}/tokens/${chainId}/${file}`,
        e
      );
      return;
    }

    if (cdnFileResponse.status !== 200) {
      try {
        const uploadedFile = await cloudinary.v2.uploader.upload(
          path.join(dir, file),
          {
            folder: `tokens/${chainId}`,
            use_filename: true,
            unique_filename: false,
          }
        );
        console.log("Uploaded logo", uploadedFile);
      } catch (e) {
        console.log("Error uploading file", chainId, file, e);
      }
    }
  }
}
