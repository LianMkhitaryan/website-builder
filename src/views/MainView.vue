<template>
  <div class="main-view">
    <Sidebar />
    <Editor />
  </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
import Editor from '../components/Editor.vue'
</script>

<style scoped lang="scss">
.main-view {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style>
