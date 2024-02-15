<script lang="ts" setup>
import { toggleDark } from "~/composables";
import { ref, unref } from "vue";
import { ClickOutside as vClickOutside } from "element-plus";

const namiFound = !!(window as any).cardano.nami;
const eternlFound = !!(window as any).cardano.eternl;
const flintFound = !!(window as any).cardano.flint;

const buttonRef = ref();
const popoverRef = ref();
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.();
};
</script>

<script lang="ts">
import {
  Address,
  BaseAddress,
  MultiAsset,
  Assets,
  ScriptHash,
  Costmdls,
  Language,
  CostModel,
  AssetName,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  Value,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutputBuilder,
  LinearFee,
  BigNum,
  BigInt,
  TransactionHash,
  TransactionInputs,
  TransactionInput,
  TransactionWitnessSet,
  Transaction,
  PlutusData,
  PlutusScripts,
  PlutusScript,
  PlutusList,
  Redeemers,
  Redeemer,
  RedeemerTag,
  Ed25519KeyHashes,
  ConstrPlutusData,
  ExUnits,
  Int,
  NetworkInfo,
  EnterpriseAddress,
  TransactionOutputs,
  hash_transaction,
  hash_script_data,
  hash_plutus_data,
  ScriptDataHash,
  Ed25519KeyHash,
  NativeScript,
  StakeCredential,
} from "@emurgo/cardano-serialization-lib-asmjs";
import { Buffer } from "buffer";
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState(["whichWalletSelected"]),
  },
  data() {
    return {
      // address:
      //   "addr1qxu7nks0vt5te3dx2wmwq5ytz7td8hsvytl2zwkrjvwm0vmy3va7sk0l7yrpe9m3s3230ynqef8p0997ddhvkpkrkuysdhwdrg",
      address:
        "addr_test1qqvrxad4q4426ajkaddj5cl653mcr99svv4x87ke0uuhzheghnevm2hmuu6j5ncfe0yvzfm6wfrary64wuhd7jufetnq4zalvc",
      wallet: ref("eternl"),
      API: undefined as any,

      selectedTabId: "1",
      // whichWalletSelected: undefined as any,
      walletFound: false,
      walletIsEnabled: false,
      walletName: undefined as any,
      walletIcon: undefined as any,
      walletAPIVersion: undefined as any,
      wallets: [],

      networkId: undefined as any,
      Utxos: undefined as any,
      CollatUtxos: undefined as any,
      balance: undefined as any,
      changeAddress: undefined as any,
      rewardAddress: undefined as any,
      usedAddress: undefined as any,

      txBody: undefined as any,
      txBodyCborHex_unsigned: "",
      txBodyCborHex_signed: "",
      submittedTxHash: "",

      addressBech32SendADA:
        "addr_test1qrt7j04dtk4hfjq036r2nfewt59q8zpa69ax88utyr6es2ar72l7vd6evxct69wcje5cs25ze4qeshejy828h30zkydsu4yrmm",
      lovelaceToSend: 3000000,
      assetNameHex: "4c494645",
      assetPolicyIdHex:
        "ae02017105527c6c0c9840397a39cc5ca39fabe5b9998ba70fda5f2f",
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
  },

  methods: {
    ...mapActions(["updateWhichWalletSelected"]),
    async refreshData() {
      if (this.checkIfWalletFound()) {
        await this.getAPIVersion();
        await this.getWalletName();
        const walletEnabled = await this.enableWallet();
        if (walletEnabled) {
          await this.getNetworkId();
          await this.getUtxos();
          await this.getCollateral();
          // await this.getBalance();
          // await this.getChangeAddress();
          // await this.getRewardAddresses();
          await this.getUsedAddresses();
        }
      }
    },

    async getUtxos() {
      let Utxos = [];

      try {
        const rawUtxos = await this.API.getUtxos();
        console.log(rawUtxos);

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
                const assetNameHex = Buffer.from(
                  assetName.name(),
                  "utf8"
                ).toString("hex");
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
        console.log(Utxos);
        this.Utxos = Utxos;
      } catch (err) {
        console.log(err);
      }
    },

    async getCollateral() {
      let CollatUtxos = [];

      try {
        let collateral = [];

        const wallet = this.whichWalletSelected;
        if (wallet === "nami") {
          collateral = await this.API.experimental.getCollateral();
        } else {
          collateral = await this.API.getCollateral();
        }

        console.log(collateral);
        console.log(123);

        for (const x of collateral) {
          const utxo = TransactionUnspentOutput.from_bytes(
            Buffer.from(x, "hex")
          );
          CollatUtxos.push(utxo);
          // console.log(utxo)
        }
        this.CollatUtxos = CollatUtxos;
      } catch (err) {
        console.log(err);
      }
    },

    async getUsedAddresses() {
      try {
        const raw = await this.API.getUsedAddresses();
        const rawFirst = raw[1];
        const usedAddress = Address.from_bytes(
          Buffer.from(rawFirst, "hex")
        ).to_bech32();
        this.usedAddress = usedAddress;
      } catch (err) {
        console.log(err);
      }
    },

    async getNetworkId() {
      try {
        const networkId = await this.API.getNetworkId();
        console.log(networkId);
      } catch (err) {
        console.log(err);
      }
    },

    async enableWallet() {
      try {
        // window.cardano.nami.enable();
        this.API = await (window as any).cardano[
          this.whichWalletSelected
        ].enable();
      } catch (err) {
        console.log(err);
      }
      return this.checkIfWalletEnabled();
    },

    async checkIfWalletEnabled() {
      let walletIsEnabled = false;

      try {
        walletIsEnabled = await (window as any).cardano[
          this.whichWalletSelected
        ].isEnabled();
      } catch (err) {
        console.log(err);
      }

      return walletIsEnabled;
    },

    getAPIVersion() {
      const walletAPIVersion = (window as any)?.cardano?.[
        this.whichWalletSelected
      ].apiVersion;
      return walletAPIVersion;
    },

    getWalletName() {
      const walletName = (window as any)?.cardano?.[this.whichWalletSelected]
        .name;
      return walletName;
    },

    checkIfWalletFound() {
      const walletFound = !!(window as any).cardano?.[this.whichWalletSelected];
      return walletFound;
    },

    handleWalletSelect() {
      this.updateWhichWalletSelected(this.wallet);
      this.refreshData();
    },
  },
};
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false">
    <el-menu-item index="1">Element Plus</el-menu-item>
    <el-sub-menu index="2">
      <template #title>Workspace</template>
      <el-menu-item index="2-1">item one</el-menu-item>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>Info</el-menu-item>
    <el-menu-item index="4">Orders</el-menu-item>
    <el-menu-item h="full" @click="toggleDark()">
      <button
        class="border-none w-full bg-transparent cursor-pointer"
        style="height: var(--ep-menu-item-height)"
      >
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item ref="buttonRef" v-click-outside="onClickOutside">
      Connect Wallet
    </el-menu-item>
  </el-menu>

  <el-popover
    ref="popoverRef"
    :virtual-ref="buttonRef"
    trigger="click"
    virtual-triggering
  >
    <el-radio-group v-model="wallet" @change="handleWalletSelect">
      <el-radio label="nami" size="large" :disabled="!namiFound">nami</el-radio>
      <el-radio label="eternl" size="large" :disabled="!eternlFound"
        >eternl</el-radio
      >
      <el-radio label="flint" size="large" :disabled="!flintFound"
        >flint</el-radio
      >
    </el-radio-group>
  </el-popover>
</template>

<style>
.flex-grow {
  flex-grow: 4;
}
</style>
