<style>
</style>

<template>
  <div>
    <el-radio-group v-model="wallet">
      <el-radio label="nami" size="large">nami({{ namiFound }})</el-radio>
      <el-radio label="eternl" size="large">eternl({{ eternlFound }})</el-radio>
      <el-radio label="flint" size="large">flint({{ flintFound }})</el-radio>
    </el-radio-group>

    <el-button @click="Connect">Connect</el-button>
    <el-button @click="DisConnect">DisConnect</el-button>

    <el-button @click="addDataToDB([])">addDataToDB</el-button>
    <el-button @click="getDataFromDB">getDataFromDB</el-button>
    <el-button @click="clearDataToDB">clearDataToDB</el-button>
    <el-input v-model="address" placeholder="address">
      <template #append>
        <el-button :icon="Search" @click="onSubmit" />
      </template>
    </el-input>

    <el-table :data="utxos" style="width: 100%; margin-top: 20px">
      <el-table-column label="Hash # Idx" width="600px">
        <template #default="scope">
          <span>{{ scope.row.tx_hash }}#{{ scope.row.unit }}</span>
          <br />
        </template>
      </el-table-column>

      <el-table-column label="Amount">
        <template #default="props">
          <el-table :data="props.row.amount" :show-header="false">
            <el-table-column prop="unit" />
            <el-table-column prop="quantity" width="200px" />
          </el-table>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { ref } from "vue";
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

const namiFound = !!(window as any).cardano.nami;
const eternlFound = !!(window as any).cardano.eternl;
const flintFound = !!(window as any).cardano.flint;

const DB_NAME = "TestDB";
const STORE_NAME = "utxoMap";

let db: IDBDatabase;

var baseUrl = "http://localhost:8080/";

export default {
  data() {
    return {
      // address:
      //   "addr1qxu7nks0vt5te3dx2wmwq5ytz7td8hsvytl2zwkrjvwm0vmy3va7sk0l7yrpe9m3s3230ynqef8p0997ddhvkpkrkuysdhwdrg",
      address:
        "addr_test1qqvrxad4q4426ajkaddj5cl653mcr99svv4x87ke0uuhzheghnevm2hmuu6j5ncfe0yvzfm6wfrary64wuhd7jufetnq4zalvc",
      utxos: [] as any[],
      wallet: ref("eternl"),
      API: undefined as any,

      selectedTabId: "1",
      whichWalletSelected: undefined,
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

  computed: {},

  mounted() {
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = (event) => {
      console.log("打开数据库出错！", (event.target as any).error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result;
      // const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      // store.createIndex("id", "id", { unique: true });

      const store = db.createObjectStore(STORE_NAME);
    };

    request.onsuccess = (event) => {
      db = request.result;
      console.log("成功打开数据库！");
      this.getDataFromDB();
    };
  },

  methods: {
    async DisConnect() {},

    async Connect() {
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
        this.API = await (window as any).cardano[this.wallet].enable();
      } catch (err) {
        console.log(err);
      }
      return this.checkIfWalletEnabled();
    },

    async checkIfWalletEnabled() {
      let walletIsEnabled = false;

      try {
        walletIsEnabled = await (window as any).cardano[
          this.wallet
        ].isEnabled();
      } catch (err) {
        console.log(err);
      }

      return walletIsEnabled;
    },

    getAPIVersion() {
      const walletAPIVersion = (window as any)?.cardano?.[this.wallet]
        .apiVersion;
      return walletAPIVersion;
    },

    getWalletName() {
      const walletName = (window as any)?.cardano?.[this.wallet].name;
      return walletName;
    },

    checkIfWalletFound() {
      const walletFound = !!(window as any).cardano?.[this.wallet];
      const walletFound2 = !!(window as any)?.cardano?.["nami"];
      return walletFound;
    },

    clearDataToDB() {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      transaction.oncomplete = () => {
        console.log("清除数据库！");
      };
    },

    deleteDataToDBByAddress(address: string) {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(address);

      transaction.oncomplete = () => {
        console.log("删除数据！");
      };
    },

    addDataToDB(utxos: []) {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      store.add(utxos, this.address);

      transaction.oncomplete = () => {
        console.log("成功添加数据到数据库！");
      };

      transaction.onerror = (event) => {
        console.log("添加数据到数据库出错！", (event.target as any).error);
      };
    },

    getDataFromDB() {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(this.address);

      request.onsuccess = (event) => {
        this.utxos = (event.target as any).result;
        // event.target.result
        console.log((event.target as any).result);
      };
      request.onerror = (event) => {
        console.log("从数据库获取数据出错！", (event.target as any).error);
      };
    },

    onSubmit() {
      axios
        .get(
          baseUrl +
            "utxo/getUtxoByAddress?address=" +
            this.address +
            "&count=" +
            100 +
            "&page=" +
            1
        )
        .then((res: any) => {
          this.utxos = res.data.value;

          this.deleteDataToDBByAddress(this.address);
          this.addDataToDB(res.data.value);
        })
        .catch((err: any) => {
          //请求失败的回调函数
          console.log(err);
        });
    },
  },
};
</script>


<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";

const windowasany = window as any;
</script>





