<style>
</style>

<template>
  <div>
    <el-button @click="addDataToDB([])">addDataToDB</el-button>
    <el-button @click="getDataFromDB">getDataFromDB</el-button>
    <el-button @click="clearDataToDB">clearDataToDB</el-button>
    <el-input v-model="address" placeholder="address">
      <template #append>
        <el-button :icon="Search" @click="onSubmit" />
      </template>
    </el-input>

    <el-table :data="utxos" style="width: 100%">
      <el-table-column
        prop="tx_hash"
        label="Transaction Hash"
      ></el-table-column>
      <el-table-column
        prop="output_index"
        label="Output Index"
      ></el-table-column>
      <el-table-column
        prop="amount"
        label="Amount"
        :formatter="formatAmount"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import axios from "axios";

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
    formatAmount(row: any) {
      return row.amount
        .map((item: any) => `${item.quantity} ${item.unit}`)
        .join(", ");
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
import { onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
</script>





