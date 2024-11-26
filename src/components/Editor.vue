<script setup lang="ts">
import { ref } from 'vue'

type Widget = {
  id: number
  type: string
  content: string
  isEditing: boolean
  columns?: Widget[][]
  exist: boolean
}

const droppedWidgets = ref<Widget[]>([])
const logList = ref<string[]>([])
let dragSourceIndex: number | null = null

// Drop handling for new widgets
function onDrop(event: DragEvent) {
  event.preventDefault()

  let data: any = event.dataTransfer?.getData('widget')

  if (!data) {
    return
  }

  data = JSON.parse(data)

  if (data.exist) {
    return
  }

  const widget: Widget = {
    id: Date.now(),
    type: data.type,
    content: '',
    isEditing: data.editable,
    exist: true
  }

  if (data.columns) {
    widget.columns = data.columns
  }

  droppedWidgets.value.push(widget)
}

function onDropColumn(event: DragEvent, widgetId: number, column: number) {
  event.preventDefault()

  let data: any = event.dataTransfer?.getData('widget')

  if (!data) {
    return
  }

  data = JSON.parse(data)

  const widget: Widget | undefined = droppedWidgets.value.find((item: Widget) => item.id === widgetId)

  if (!widget || !widget.columns) {
    return
  }

  widget.columns[column].push(data)

  const widgetToRemoveIndex = droppedWidgets.value.findIndex((item: Widget) => item.id === data.id)

  if (widgetId === droppedWidgets.value[widgetToRemoveIndex].id) {
    return
  }

  droppedWidgets.value.splice(widgetToRemoveIndex, 1)
}

// Allow dragging over editor
function allowDrop(event: DragEvent) {
  event.preventDefault()
}

// Update content for specific widget
function updateWidgetContent(id: number, content: string) {
  const widget = droppedWidgets.value.find((w) => w.id === id)
  if (widget) {
    widget.content = content
  }
}

// Save the content of the textarea
function onSave(widgetId: number) {
  const widget = droppedWidgets.value.find((w) => w.id === widgetId)
  if (widget) {
    const note = widget.content
    addNoteToLog(note)
    widget.isEditing = false
  }
}

// Add note to log list
function addNoteToLog(noteText: string) {
  const timestamp = new Date().toLocaleString('en-US')
  logList.value.push(`${timestamp} - ${noteText}`)
}

// Handle image upload
function handleImageUpload(event: Event, id: number) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      updateWidgetContent(id, reader.result as string)
    }
    reader.readAsDataURL(file)
  }
}

// Handle drag start
function onDragStart(index: number) {
  dragSourceIndex = index
}

// Handle drop to reorder widgets
function onDropReorder(event: DragEvent, targetIndex: number) {
  event.preventDefault()
  if (dragSourceIndex !== null && dragSourceIndex !== targetIndex) {
    const draggedWidget = droppedWidgets.value.splice(dragSourceIndex, 1)[0]
    if (!draggedWidget) {
      return
    }
    droppedWidgets.value.splice(targetIndex, 0, draggedWidget)
  }
  dragSourceIndex = null
}
</script>

<template>
  <div class="editor" @drop="onDrop" @dragover="allowDrop">
    <div
      v-for="(widget, index) in droppedWidgets"
      :key="widget.id"
      class="widget"
      :class="`widget-${widget.type}`"
      draggable="true"
      @dragstart="(event) => {
        onDragStart(index);
        event.dataTransfer?.setData('widget', JSON.stringify(widget));
      }"
      @dragover.prevent
      @drop="onDropReorder($event, index)"
    >
      <div v-if="widget.type === 'text'" class="text-widget">
        <div v-if="widget.isEditing">
          <textarea v-model="widget.content" placeholder="Write something..."></textarea>
          <button class="save-widget-button" @click="onSave(widget.id)">Save</button>
        </div>
        <div v-else>
          <p @click="widget.isEditing = true">{{ widget.content || 'Click to edit text' }}</p>
        </div>
      </div>

      <!-- Image Widget -->
      <div v-else-if="widget.type === 'image'" class="image-widget">
        <input
          v-if="!widget.content"
          type="file"
          accept="image/*"
          @change="(event) => handleImageUpload(event, widget.id)"
        />
        <div v-if="widget.content" class="image-preview">
          <img :src="widget.content" alt="Uploaded Image" />
        </div>
      </div>

      <!-- Button Widget -->
      <div v-else-if="widget.type === 'button'" class="button-widget">
        <div v-if="widget.isEditing">
          <input v-model="widget.content" placeholder="Enter button name" />
          <button class="save-widget-button" @click="onSave(widget.id)">Save</button>
        </div>
        <div v-else>
          <button class="button">{{ widget.content }}</button>
        </div>
      </div>

      <!-- Columns Widget -->
      <div v-else-if="widget.type === 'columns'" class="columns-widget">
        <div
          v-for="(column, index) in widget.columns"
          :key="index"
          @drop="(event) => {onDropColumn(event, widget.id, index)}"
        >
          <div
            v-for="(item, index) in column"
            :key="index"
            class="widget"
          >
            <!-- Text Widget -->
            <div v-if="item.type === 'text'" class="text-widget">
              <div v-if="item.isEditing">
                <textarea v-model="item.content" placeholder="Write something..."></textarea>
                <button class="save-widget-button" @click="onSave(item.id)">Save</button>
              </div>
              <div v-else>
                <p @click="item.isEditing = true">{{ item.content || 'Click to edit text' }}</p>
              </div>
            </div>

            <!-- Image Widget -->
            <div v-else-if="item.type === 'image'" class="image-widget">
              <input
                v-if="!item.content"
                type="file"
                accept="image/*"
                @change="(event) => handleImageUpload(event, item.id)"
              />
              <div v-if="item.content" class="image-preview">
                <img :src="item.content" alt="Uploaded Image" />
              </div>
            </div>

            <!-- Button Widget -->
            <div v-else-if="item.type === 'button'" class="button-widget">
              <div v-if="item.isEditing">
                <input v-model="item.content" placeholder="Enter button name" />
                <button class="save-widget-button" @click="onSave(item.id)">Save</button>
              </div>
              <div v-else>
                <button class="button">{{ item.content }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #f9f9f9;
  margin: 10px;
  padding: 15px;
  overflow-y: auto;
  border: 1px solid #ddd;

  .widget {
    cursor: grab;

    &:not(:last-child) {
      margin-bottom: 15px;
    }

    &:active {
      cursor: grabbing;
    }

    .text-widget {
      textarea {
        width: 100%;
        height: 80px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: none;
        font-size: 14px;
      }
    }

    .save-widget-button {
      padding: 5px 10px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .image-preview {
      img {
        max-width: 100%;
        border-radius: 8px;
      }
    }

    .button-widget {
      input {
        width: 100%;
        height: 40px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
    }
  }

  .button {
    font-size: 16px;
    padding: 10px 25px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  .widget-columns {
    background: #E8E8E8;
    padding: 0;
  }

  .columns-widget {
    display: grid;
    grid-template-columns: 1fr 1fr;

    & > * {
      padding: 15px 0 15px 15px;

      &:last-child {
        padding-right: 15px;
      }
    }
  }
}
</style>
