<script lang="ts">
import { defineComponent } from "vue";
import { mergeObject as VitePluginMixinCodeMergeObject } from "vite-plugin-mixin-code/dist/lib/index.mjs";
export default defineComponent(
  VitePluginMixinCodeMergeObject({ name: 'Test' }, { aa: "xx" })
);
</script>
<template>
  <div></div>
</template>
<script lang="ts" setup>
const m = "";
</script>