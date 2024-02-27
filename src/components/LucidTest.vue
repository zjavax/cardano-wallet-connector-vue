<template>
  <div>
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
import {
  Address,
  Blockfrost,
  Datum,
  DatumHash,
  Delegation,
  OutRef,
  ProtocolParameters,
  Provider,
  RewardAddress,
  Transaction,
  TxHash,
  Unit,
  UTxO,
} from "lucid-cardano";

// var baseUrl = "http://localhost:8080/";

export default {
  data() {
    return {
      address:
        "addr1qxu7nks0vt5te3dx2wmwq5ytz7td8hsvytl2zwkrjvwm0vmy3va7sk0l7yrpe9m3s3230ynqef8p0997ddhvkpkrkuysdhwdrg",
      // address:
      // "addr_test1qqvrxad4q4426ajkaddj5cl653mcr99svv4x87ke0uuhzheghnevm2hmuu6j5ncfe0yvzfm6wfrary64wuhd7jufetnq4zalvc",
      utxos: [] as any[],
    };
  },

  mounted() {},

  methods: {
    getUtxoByUnit(unit: Unit): Promise<UTxO> {
      let blockfrost = new Blockfrost(
        "https://cardano-mainnet.blockfrost.io/api/v0",
        process.env.BLOCKFROST_KEY
      );

      return blockfrost.getUtxoByUnit(unit);
    },
  },
};
</script>


<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
</script>





