<template>
  <div>
    <el-form-item label="UTXO Strings"> </el-form-item>
    <el-input
      type="textarea"
      v-model="utxoStrList"
      placeholder="Enter UTXO strings"
    ></el-input>

    <el-form :model="receiverData" ref="form" label-width="120px">
      <el-form-item label="Receiver Address">
        <el-input
          v-model="receiverData.receiverAddress"
          placeholder="Receiver Address"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">Submit</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { ElForm, ElFormItem, ElInput, ElButton } from "element-plus"; // Import required Element-Plus components
import axios from "axios";

var baseUrl = "http://localhost:8080/";

export default {
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
  },
  setup() {
    const utxoStrList = ref("");
    const receiverData = ref({
      receiverAddress: "",
    });

    const submitForm = () => {
      // const collectFromUtxo = {
      //   utxoStrList: utxoStrList.value.split("\n"),
      //   receiverData: {
      //     receiverAddress: receiverData.value.receiverAddress,
      //   },
      // };

      // Make the API call using Axios
      axios
        .post(
          baseUrl + "utxo/getTxWithoutSign?utxoStrList=" + utxoStrList.value,
          {
            receiverAddress: receiverData.value.receiverAddress,
          }
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

    return {
      utxoStrList,
      receiverData,
      submitForm,
    };
  },
};
</script>



