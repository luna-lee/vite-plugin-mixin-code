<template>
  <div></div>
</template>
<script lang="ts">
import { mergeObject as VitePluginMixinCodeMergeObject } from "vite-plugin-mixin-code/dist/lib/index.mjs";
export default VitePluginMixinCodeMergeObject(
  VitePluginMixinCodeMergeObject({ name: 'Test' }, { aa: "xx" }),
  {}
);
</script>