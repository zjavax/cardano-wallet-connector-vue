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
import { mapState } from "vuex";

export default {
  data() {
    return {
      wallet: "eternl",
    };
  },

  computed: {
    ...mapState(["whichWalletSelected", "walletFound"]),
  },

  mounted() {
    if (
      localStorage.getItem("wallet") !== null &&
      localStorage.getItem("wallet") !== ""
    ) {
      this.wallet = localStorage.getItem("wallet") as string;
    }
  },

  methods: {
    handleWalletSelect() {
      localStorage.setItem("wallet", this.wallet);
    },
  },
};
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false" router>
    <el-menu-item index="/">Cardano</el-menu-item>
    <!-- <el-sub-menu index="2">
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
    <el-menu-item index="4">Orders</el-menu-item> -->
    <el-menu-item index="/CollectFromUtxoList">多钱包发送</el-menu-item>

    <div class="flex-grow" />
    <el-menu-item ref="buttonRef" v-click-outside="onClickOutside">
      Connect Wallet
    </el-menu-item>

    <el-menu-item index="/BaseSetting">Base Setting</el-menu-item>

    <el-menu-item h="full" @click="toggleDark()">
      <button
        class="border-none w-full bg-transparent cursor-pointer"
        style="height: var(--ep-menu-item-height)"
      >
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
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
