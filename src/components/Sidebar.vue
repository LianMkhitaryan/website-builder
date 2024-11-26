<script setup lang="ts">
const widgets = [
  { id: 1, name: 'Text', type: 'text', editable: true },
  { id: 2, name: 'Image', type: 'image', editable: false },
  { id: 3, name: 'Button', type: 'button', editable: true },
  { id: 4, name: 'Columns', type: 'columns', editable: false, columns: [[], []] },
]
</script>

<template>
  <div class="sidebar">
    <h3>Widgets</h3>
    <ul>
      <li
        v-for="widget in widgets"
        :key="widget.id"
        draggable="true"
        @dragstart="(event) => event.dataTransfer?.setData('widget', JSON.stringify(widget))"
      >
        {{ widget.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  width: 250px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #ccc;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 20px;

  h3 {
    margin-bottom: 20px;
    font-size: 18px;
    color: #333;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin: 10px 0;
      padding: 10px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: grab;
      text-align: center;

      &:hover {
        background: #f3f3f3;
      }
    }
  }
}
</style>
