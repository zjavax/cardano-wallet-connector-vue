<template>
  <el-form :model="dh" label-width="320px">
    <el-form-item label="Wallet Address">
      <el-input v-model="dh.wallet_address" clearable />
    </el-form-item>
    <el-form-item label="Frontend(UI) Fee Receiver address">
      <el-input v-model="dh.ui_fee_address" clearable />
    </el-form-item>
    <el-form-item label="cborHex">
      <el-input
        type="textarea"
        v-model="dh.cborHex"
        :autosize="{ minRows: 6, maxRows: 12 }"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">submit</el-button>
    </el-form-item>
  </el-form>

  <el-form label-width="320px">
    <el-form-item label="cborHex">
      <el-input
        type="textarea"
        v-model="cborHexExcludeFee"
        :autosize="{ minRows: 6, maxRows: 12 }"
      ></el-input>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import axios from "axios";

// do not use same name with ref
const dh = reactive({
  wallet_address:
    "addr1qyzkwx6qnkrpu9h6eyja57mm7e0glt4n4pujwrdvafmayexykyj0nm8w06869gsel9rdl46l9fn288nmj37w8hjpythsccmcvl",
  ui_fee_address:
    "addr1qyzkwx6qnkrpu9h6eyja57mm7e0glt4n4pujwrdvafmaye9gmt3y9n652ft4wmfyxjsk576kemyenk9pn4a754csyr2sk40479",
  cborHex:
    "84a60086825820253a71995e1e1a51d290827586836f6e704c1baf7ba032aecf3d1f50c59d6aac0a8258203703725f5f1887b822c669c71c9e7cda09469ead6ace3ad58884c23b023761c90982582039b1853a1c3550c42dfdb61ab216f756f3eba8bdcf21e262beba1eb949d4ae1b02825820529deac05e4a0a7166bcc6f5384bab19c02285ff9e2ae68dac9e7646bdd86a68008258208f0b986d59300890c80f8a2a1586bde75743fcc0a6a6423a206c1ebc6e4dd8450382582091af959c5dec1d089595d4dc739821c7b24882a565e0eddaa731c278207e163000018383583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21b000000037db6488058201da4b6c5c6ac425373844776984e8ceb3504b8e38fb9bf608a0619a615611ca78258390105671b409d861e16fac925da7b7bf65e8faeb3a879270dacea77d264a8dae242cf545257576d2434a16a7b56cec999d8a19d7bea571020d51a000ecc168258390105671b409d861e16fac925da7b7bf65e8faeb3a879270dacea77d264c4b124f9ecee7e8fa2a219f946dfd75f2a66a39e7b947ce3de4122ef821a00cbdfa4a2581c9abf0afd2f236a19f2842d502d0450cbcd9c79f123a9708f96fd9b96a144454e43531a002dc6c0581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa142776301021a00030975031a06fe00eb075820b64602eebf602e8bbce198e2a1d6bbb2a109ae87fa5316135d217110d6d946490b5820cb9855d3d1e834c47f9ea23edbb65554b473cc5b39a0590ebe81f53f96ee7796a1049fd8799fd8799fd8799f581c05671b409d861e16fac925da7b7bf65e8faeb3a879270dacea77d264ffd8799fd8799fd8799f581ca8dae242cf545257576d2434a16a7b56cec999d8a19d7bea571020d5ffffffffd8799fd8799f581c05671b409d861e16fac925da7b7bf65e8faeb3a879270dacea77d264ffd8799fd8799fd8799f581ca8dae242cf545257576d2434a16a7b56cec999d8a19d7bea571020d5ffffffffd87a80d8799fd8799f581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f44534e454bff1a008a028eff1a001e84801a001e8480fffff5a11902a2a1636d736781781c4d696e737761703a205377617020457861637420496e204f72646572",
});

const cborHexExcludeFee = ref("");

// import * as dotenv from "dotenv";

// dotenv.config();

// const baseUrl = "http://" + process.env.IP + ":8080/";

const baseUrl = "http://localhost:8080/";

const onSubmit = async () => {
  axios
    .post(
      baseUrl +
        "utxo/getByTxExcludeFee?walletAddress=" +
        dh.wallet_address +
        "&uiFeeAddress=" +
        dh.ui_fee_address +
        "&cborHex=" +
        dh.cborHex
    )
    .then((response) => {
      cborHexExcludeFee.value = response.data;
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
};
</script>
