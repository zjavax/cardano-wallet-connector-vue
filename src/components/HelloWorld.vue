<template>
  <div class="common-layout">
    <el-container>
      <el-main>
        <el-radio-group
          v-model="state.wallet_id.value"
          @change="handleWalletSelect"
        >
          <el-radio label="nami" size="large" :disabled="!namiFound"
            >nami</el-radio
          >
          <el-radio label="eternl" size="large" :disabled="!eternlFound"
            >eternl</el-radio
          >
          <el-radio label="flint" size="large" :disabled="!flintFound"
            >flint</el-radio
          >

          <el-radio label="wallet_input" size="large">
            <el-input v-model="wallet_input" placeholder="cip-30 wallet id">
              <template #append>
                <el-button :icon="Search" @click="handleWalletSelect" />
              </template>
            </el-input>
          </el-radio>
        </el-radio-group>

        <el-descriptions title="Wallet Info" :column="1" size="large">
          <el-descriptions-item label="Wallet Found">{{
            state.walletFound
          }}</el-descriptions-item>
          <el-descriptions-item label="Wallet Connected"
            >state.walletFound.value</el-descriptions-item
          >
          <el-descriptions-item label="Wallet API version">{{
            state.walletAPIVersion
          }}</el-descriptions-item>
          <el-descriptions-item label="Wallet name:"
            >Suzhou</el-descriptions-item
          >
          <el-descriptions-item label="Network Id (0 = testnet; 1 = mainnet):"
            >Suzhou</el-descriptions-item
          >
          <el-descriptions-item
            label="UTXOs: (UTXO #txid = ADA amount + AssetAmount + policyId.AssetName + ...):"
            >Suzhou</el-descriptions-item
          >
          <el-descriptions-item label="Balance Lovelace:"
            >Suzhou</el-descriptions-item
          >
          <el-descriptions-item label="Change Address:"
            >Suzhou</el-descriptions-item
          >
          <el-descriptions-item label="Staking Address:"
            >Suzhou</el-descriptions-item
          >
          <el-descriptions-item label="Used Address:"
            >Suzhou</el-descriptions-item
          >
        </el-descriptions>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Buffer } from "buffer";
import axios from "axios";
import { Search } from "@element-plus/icons-vue";
import {
  Address,
  Value,
  TransactionUnspentOutput,
} from "@emurgo/cardano-serialization-lib-asmjs";

const namiFound = !!(window as any).cardano.nami;
const eternlFound = !!(window as any).cardano.eternl;
const flintFound = !!(window as any).cardano.flint;

const refreshData = async () => {
  if (checkIfWalletFound()) {
    await getAPIVersion();
    await getWalletName();
    const walletEnabled = await enableWallet();
    if (walletEnabled) {
      await getNetworkId();
      await getUtxos();
      await getCollateral();
      await getBalance();
      await getChangeAddress();
      await getRewardAddresses();
      await getUsedAddresses();
    }
  }
};

const getUtxos = async () => {
  let Utxos = [];

  try {
    const rawUtxos = await API.getUtxos();

    for (const rawUtxo of rawUtxos) {
      const utxo = TransactionUnspentOutput.from_bytes(
        Buffer.from(rawUtxo, "hex")
      );
      const input = utxo.input();
      const txid = Buffer.from(
        input.transaction_id().to_bytes() as any,
        "utf8"
      ).toString("hex");
      const txindx = input.index();
      const output = utxo.output();
      const amount = output.amount().coin().to_str(); // ADA amount in lovelace
      const multiasset = output.amount().multiasset();
      let multiAssetStr = "";

      if (multiasset) {
        const keys = multiasset.keys(); // policy Ids of thee multiasset
        const N = keys.len();
        // console.log(`${N} Multiassets in the UTXO`)

        for (let i = 0; i < N; i++) {
          const policyId = keys.get(i);
          const policyIdHex = Buffer.from(
            policyId.to_bytes() as any,
            "utf8"
          ).toString("hex");
          // console.log(`policyId: ${policyIdHex}`)
          const assets = multiasset.get(policyId);
          const assetNames = (assets as any).keys();
          const K = assetNames.len();
          // console.log(`${K} Assets in the Multiasset`)

          for (let j = 0; j < K; j++) {
            const assetName = assetNames.get(j);
            const assetNameString = Buffer.from(
              assetName.name(),
              "utf8"
            ).toString();
            const assetNameHex = Buffer.from(assetName.name(), "utf8").toString(
              "hex"
            );
            const multiassetAmt = multiasset.get_asset(policyId, assetName);
            multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`;
            // console.log(assetNameString)
            // console.log(`Asset Name: ${assetNameHex}`)
          }
        }
      }

      const obj = {
        txid: txid,
        txindx: txindx,
        amount: amount,
        str: `${txid} #${txindx} = ${amount}`,
        multiAssetStr: multiAssetStr,
        TransactionUnspentOutput: utxo,
      };
      Utxos.push(obj);
      // console.log(`utxo: ${str}`)
    }
    state.Utxos.value = Utxos;
  } catch (err) {
    console.log(err);
  }
};

const getUsedAddresses = async () => {
  try {
    const raw = await API.getUsedAddresses();
    const rawFirst = raw[0];
    const usedAddress = Address.from_bytes(
      Buffer.from(rawFirst, "hex")
    ).to_bech32();
    // console.log(rewardAddress)
    state.usedAddress.value = usedAddress;
  } catch (err) {
    console.log(err);
  }
};

const getCollateral = async () => {
  let CollatUtxos = [];

  try {
    let collateral = [];

    const wallet = state.whichWalletSelected.value;
    if (wallet === "nami") {
      collateral = await API.experimental.getCollateral();
    } else {
      collateral = await API.getCollateral();
    }

    for (const x of collateral) {
      const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, "hex"));
      CollatUtxos.push(utxo);
      // console.log(utxo)
    }

    state.CollatUtxos.value = CollatUtxos;
  } catch (err) {
    console.log(err);
  }
};

const getBalance = async () => {
  try {
    const balanceCBORHex = await API.getBalance();

    const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex"))
      .coin()
      .to_str();

    state.balance.value = balance;
  } catch (err) {
    console.log(err);
  }
};

const getChangeAddress = async () => {
  try {
    const raw = await API.getChangeAddress();
    const changeAddress = Address.from_bytes(
      Buffer.from(raw, "hex")
    ).to_bech32();
    state.changeAddress.value = changeAddress;
  } catch (err) {
    console.log(err);
  }
};

const getRewardAddresses = async () => {
  try {
    const raw = await API.getRewardAddresses();
    const rawFirst = raw[0];
    const rewardAddress = Address.from_bytes(
      Buffer.from(rawFirst, "hex")
    ).to_bech32();

    state.rewardAddress.value = rewardAddress;
  } catch (err) {
    console.log(err);
  }
};

const getNetworkId = async () => {
  try {
    const networkId = await API.getNetworkId();
    state.networkId.value = networkId;
  } catch (err) {
    console.log(err);
  }
};

const enableWallet = async () => {
  try {
    // window.cardano.nami.enable();
    API = await (window as any).cardano[
      state.whichWalletSelected.value
    ].enable();
  } catch (err) {
    console.log(err);
  }
  return checkIfWalletEnabled();
};

const checkIfWalletEnabled = async () => {
  let walletIsEnabled = false;

  try {
    const walletName = state.whichWalletSelected.value;
    walletIsEnabled = await window.cardano[walletName].isEnabled();
  } catch (err) {
    console.log(err);
  }

  state.walletIsEnabled = walletIsEnabled;
  return walletIsEnabled;
};

const getWalletName = () => {
  const walletKey = state.whichWalletSelected.value;
  const walletName = window?.cardano?.[walletKey].name;
  state.walletName.value = walletName;
  return walletName;
};

const getAPIVersion = async () => {
  const walletAPIVersion = (window as any)?.cardano?.[
    state.whichWalletSelected.value
  ].apiVersion;
  state.walletAPIVersion.value = walletAPIVersion;
  return walletAPIVersion;
};

// 检查浏览器是否有钱包（但是不检查钱包是否开启dapp(enable)）
const checkIfWalletFound = () => {
  const walletKey = state.whichWalletSelected.value;
  const walletFound = !!window?.cardano?.[walletKey];
  state.walletFound.value = walletFound;
  return walletFound;
};

const handleWalletSelect = () => {
  state.whichWalletSelected.value = state.wallet_id.value;
  if (state.wallet_id.value == "wallet_input") {
    state.whichWalletSelected.value = wallet_input.value;
  }

  console.log(state.whichWalletSelected.value);
  refreshData();
};

const wallet_input = ref("");
let API = undefined as any;
const state = {
  selectedTabId: "1",
  wallet_id: ref(""),
  whichWalletSelected: ref(""),
  walletFound: ref(),
  walletIsEnabled: false,
  walletName: ref(""),
  walletIcon: undefined,
  walletAPIVersion: ref(),
  wallets: [],

  networkId: ref(),
  Utxos: ref(),
  CollatUtxos: ref(),
  balance: ref(),
  changeAddress: ref(),
  rewardAddress: ref(),
  usedAddress: ref(),

  txBody: undefined,
  txBodyCborHex_unsigned: "",
  txBodyCborHex_signed: "",
  submittedTxHash: "",

  addressBech32SendADA:
    "addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm",
  lovelaceToSend: 3000000,
  assetNameHex: "7447454e53",
  assetPolicyIdHex: "c6e65ba7878b2f8ea0ad39287d3e2fd256dc5c4160fc19bdf4c4d87e",
  assetAmountToSend: 5,
  addressScriptBech32:
    "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
  datumStr: "12345678",
  plutusScriptCborHex: "4e4d01000033222220051200120011",
  transactionIdLocked: "",
  transactionIndxLocked: 0,
  lovelaceLocked: 3000000,
  manualFee: 900000,
};
</script>