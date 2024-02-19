

<template>
  <div>
    <el-divider content-position="left">inputs 输入</el-divider>
    <el-form label-width="200px">
      <el-form-item label="UTXO(Hash#Idx)" required>
        <el-input type="textarea" v-model="utxoStrListStr" clearable></el-input>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">outputs 输出</el-divider>
    <el-form :model="receiverData" label-width="200px">
      <el-form-item label="Receiver Address" required>
        <el-input v-model="receiverData.receiverAddress" clearable></el-input>
      </el-form-item>

      <el-form-item label="signersCount" required>
        <el-input-number v-model="receiverData.signersCount" :min="1" />
      </el-form-item>

      <el-form-item label="assetList">
        <el-input
          clearable
          v-model="receiverData.assetListStr"
          :formatter="formatValue"
          :parser="parseValue"
        />
      </el-form-item>

      <el-divider content-position="left">Extract rewards 提取奖励</el-divider>
      <el-form-item label="奖励地址">
        <el-input
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

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
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
};
</script>
