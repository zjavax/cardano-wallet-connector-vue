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
            >18100000000</el-descriptions-item
          >
          <el-descriptions-item label="Wallet API version"
            >Suzhou</el-descriptions-item
          >
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

const namiFound = !!(window as any).cardano.nami;
const eternlFound = !!(window as any).cardano.eternl;
const flintFound = !!(window as any).cardano.flint;

const refreshData = async () => {
  checkIfWalletFound();
  // if (checkIfWalletFound()) {
  //   await this.getAPIVersion();
  //   await this.getWalletName();
  //   const walletEnabled = await this.enableWallet();
  //   if (walletEnabled) {
  //     await this.getNetworkId();
  //     await this.getUtxos();
  //     await this.getCollateral();
  //     // await this.getBalance();
  //     // await this.getChangeAddress();
  //     // await this.getRewardAddresses();
  //     await this.getUsedAddresses();
  //   }
  // }
};

// 检查浏览器是否有钱包（但是不检查钱包是否开启dapp(enable)）
const checkIfWalletFound = async () => {
  state.walletFound.value =
    !!window?.cardano?.[state.whichWalletSelected.value];
  console.log("state.walletFound=" + state.walletFound);
  return state.walletFound;
};

const handleWalletSelect1 = () => {
  if (state.whichWalletSelected.value == "wallet_id") {
    if (state.wallet_id.value == "") {
      state.whichWalletSelected.value = "";
      alert("please input wallet id");
      return;
    }
    state.whichWalletSelected.value = state.wallet_id.value;
  }

  console.log(state.whichWalletSelected.value);

  // alert(state.whichWalletSelected.value);

  refreshData();
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
const state = {
  selectedTabId: "1",
  wallet_id: ref(""),
  whichWalletSelected: ref(""),
  walletFound: ref(false),
  walletIsEnabled: false,
  walletName: undefined,
  walletIcon: undefined,
  walletAPIVersion: undefined,
  wallets: [],

  networkId: undefined,
  Utxos: undefined,
  CollatUtxos: undefined,
  balance: undefined,
  changeAddress: undefined,
  rewardAddress: undefined,
  usedAddress: undefined,

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