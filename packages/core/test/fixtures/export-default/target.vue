<template>
  <div></div>
</template>
<script lang="ts">
  import { mergeObject as VitePluginMixinCodeMergeObject } from "vite-plugin-mixin-code/dist/lib/index";
  export default VitePluginMixinCodeMergeObject({}, { aa: "xx" });
</script>
