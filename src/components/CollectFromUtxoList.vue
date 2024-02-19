

<template>
  <div>
    <el-divider content-position="left">inputs 输入</el-divider>
    <el-form label-width="200px">
      <el-form-item label="UTXO(Hash#Idx)" required>
        <el-input
          type="textarea"
          v-model="utxoStrListStr"
          clearable
          :autosize="{ minRows: 6, maxRows: 12 }"
        ></el-input>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">outputs 输出</el-divider>
    <el-form :model="receiverData" label-width="200px">
      <el-form-item label="Receiver Address" required>
        <el-input v-model="receiverData.receiverAddress" clearable></el-input>
      </el-form-item>

      <el-form-item label="assetList">
        <el-input
          clearable
          v-model="receiverData.assetListStr"
          :formatter="formatValue"
          :parser="parseValue"
        />
      </el-form-item>

      <el-form-item label="signersCount" required>
        <el-input-number v-model="receiverData.signersCount" :min="1" />
      </el-form-item>

      <el-divider content-position="left">Extract rewards 提取奖励</el-divider>
      <el-form-item label="奖励地址">
        <el-input
          :autosize="{ minRows: 4, maxRows: 8 }"
          clearable
          type="textarea"
          placeholder="支持addr和stake"
          v-model="receiverData.stakeAddressListStr"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm()">Submit</el-button>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">unsigned tx</el-divider>

    <el-form label-width="200px">
      <el-form-item label="cborHex" required>
        <el-input
          type="textarea"
          v-model="cborHex"
          clearable
          :autosize="{ minRows: 6, maxRows: 12 }"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="sign()">Sign</el-button>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">signed tx</el-divider>
    <el-form label-width="200px">
      <el-form-item label="cborHex_signed" required>
        <el-input
          type="textarea"
          v-model="cborHex_signed"
          clearable
          :autosize="{ minRows: 6, maxRows: 12 }"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="continue_sign()"
          >Continue Sign</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {
  Transaction,
  TransactionWitnessSet,
} from "@emurgo/cardano-serialization-lib-asmjs";
import axios from "axios";
import { ref } from "vue";
import { Buffer } from "buffer";

const baseUrl = "http://localhost:8080/";

const utxoStrListStr = ref(
  "bcdc4360d9bffc13a26e9cfa88278fc9eb54ef87c60a2c8a3ac59bcb6a275852#0"
);
const receiverData = ref({
  receiverAddress:
    "addr_test1qqzahcm8fwu5jzmmrty437grrx66s27jqsu5yc6tqej6sh0chx2mw2x3carrkj5w57xt4acfrnd385ljtu08z2c42umsfdgww9",
  stakeAddressListStr:
    "addr_test1qp3rxx6ukfd4w392fptv2w6edyf3tffrepflkwekeh7kvf3ghnevm2hmuu6j5ncfe0yvzfm6wfrary64wuhd7jufetnq2tj3rt",
  signersCount: 1,
  assetListStr: "4",
});

let cborHex = ref(
  "84a5008182582074f47f80cf73dbb5499a2fff53d4731f00226401143998f8dce9745c4aa474710101868258390005dbe3674bb9490b7b1ac958f90319b5a82bd2043942634b0665a85df8b995b728d1c7463b4a8ea78cbaf7091cdb13d3f25f1e712b1557371a001e84808258390005dbe3674bb9490b7b1ac958f90319b5a82bd2043942634b0665a85df8b995b728d1c7463b4a8ea78cbaf7091cdb13d3f25f1e712b1557371a04c478858258390005dbe3674bb9490b7b1ac958f90319b5a82bd2043942634b0665a85df8b995b728d1c7463b4a8ea78cbaf7091cdb13d3f25f1e712b1557371a02639b858258390005dbe3674bb9490b7b1ac958f90319b5a82bd2043942634b0665a85df8b995b728d1c7463b4a8ea78cbaf7091cdb13d3f25f1e712b1557371a0131cdc38258390005dbe3674bb9490b7b1ac958f90319b5a82bd2043942634b0665a85df8b995b728d1c7463b4a8ea78cbaf7091cdb13d3f25f1e712b1557371a0131cdc38258390005dbe3674bb9490b7b1ac958f90319b5a82bd2043942634b0665a85df8b995b728d1c7463b4a8ea78cbaf7091cdb13d3f25f1e712b1557371a004c4b40021a0002be85031a027c3f6c0800a0f5f6"
);

let cborHex_tx_json = "";

let cborHex_signed = ref("");

let API = undefined;

// 定义对象类型
const Asset = {
  policyId: String,
  assetName: String,
  quantity: String,
};

function formatValue(value: any) {
  return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Define the parser function
function parseValue(value: any) {
  return value.replace(/\$\s?|(,*)/g, "");
}

const sign = async () => {
  const tx = Transaction.from_hex(cborHex.value);

  API = await (window as any).cardano["eternl"].enable();
  let txVkeyWitnesses = await API.signTx(cborHex.value, true);
  console.log(txVkeyWitnesses);

  txVkeyWitnesses = TransactionWitnessSet.from_bytes(
    Buffer.from(txVkeyWitnesses, "hex")
  );
  const transactionWitnessSet = TransactionWitnessSet.new();
  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

  const signedTx = Transaction.new(tx.body(), transactionWitnessSet);

  const submittedTxHash = await API.submitTx(
    Buffer.from(signedTx.to_bytes() as any, "utf8").toString("hex")
  );
  console.log(submittedTxHash);
};

const continue_sign = async () => {
  const tx = Transaction.from_hex(cborHex.value);
  cborHex_tx_json = tx.to_json();
  console.log(tx.to_json());
};

const submitForm = () => {
  const receiverData2 = {
    receiverAddress: receiverData.value.receiverAddress,
    signersCount: receiverData.value.signersCount,
    stakeAddressList: receiverData.value.stakeAddressListStr.split("\n"),
    assetList: [
      {
        quantity: receiverData.value.assetListStr,
        asset_name: "ADA",
        policy_id: null,
      },
    ],
  };

  // Make the API call using Axios
  axios
    .post(
      baseUrl +
        "utxo/getTxWithoutSign?utxoStrList=" +
        encodeURIComponent(utxoStrListStr.value.split("\n") as any),
      receiverData2
    )
    .then((response) => {
      // Handle the response as needed
      console.log(response.data);
      cborHex = response.data;
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
};
</script>
