<script setup lang="ts">
import { ref } from 'vue'

type Widget = {
  id: number
  type: string
  content: string
  isEditing: boolean
  style: { top: number; left: number; width: number; height: number }
}

const droppedWidgets = ref<Widget[]>([])

// Drop handling for new widgets
function onDrop(event: DragEvent) {
  event.preventDefault()
  const widgetType = event.dataTransfer?.getData('text/plain')
  if (widgetType) {
    droppedWidgets.value.push({
      id: Date.now(),
      type: widgetType.toLowerCase(),
      content: widgetType === 'Text' ? '' : '',
      isEditing: widgetType === 'Text',
      style: { top: event.clientY, left: event.clientX, width: 200, height: 100 },
    })
  }
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
    widget.isEditing = false
  }
}

// Handle resizing
function onResize(widget: Widget, newWidth: number, newHeight: number) {
  widget.style.width = newWidth
  widget.style.height = newHeight
}

// Handle dragging
function onDrag(widget: Widget, newX: number, newY: number) {
  widget.style.top = newY
  widget.style.left = newX
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

// Handle button click (for button widget)
function handleButtonClick(id: number) {
  const widget = droppedWidgets.value.find((w) => w.id === id)
  if (widget) {
    alert(`Button clicked: ${widget.content}`)
  }
}
</script>

<template>
  <div class="editor" @drop="onDrop" @dragover="allowDrop">
    <vue-draggable-resizable
      v-for="(widget, index) in droppedWidgets"
      :key="widget.id"
      :x="widget.style.left"
      :y="widget.style.top"
      :w="widget.style.width"
      :h="widget.style.height"
      @dragging="onDrag(widget, $event.x, $event.y)"
      @resizing="onResize(widget, $event.width, $event.height)"
      :active="widget.isEditing"
      :parent="true"
    >
      <!-- Text Widget -->
      <div v-if="widget.type === 'text'" class="text-widget">
        <div v-if="widget.isEditing">
          <textarea v-model="widget.content" placeholder="Write something..."></textarea>
          <button @click="onSave(widget.id)">Save</button>
        </div>
        <div v-else>
          <p>{{ widget.content || 'Click to edit text' }}</p>
          <button @click="widget.isEditing = true">Edit</button>
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
          <input v-model="widget.content" placeholder="Button Text" />
          <button @click="onSave(widget.id)">Save</button>
        </div>
        <div v-else>
          <button @click="handleButtonClick(widget.id)">
            {{ widget.content || 'Button' }}
          </button>
        </div>
      </div>
    </vue-draggable-resizable>
  </div>
</template>

<style scoped lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #f9f9f9;
  margin: 10px;
  overflow-y: auto;
  border: 1px solid #ddd;

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
    button {
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  }

  .image-widget {
    input[type='file'] {
      margin-bottom: 10px;
    }

    .image-preview {
      margin-top: 10px;

      img {
        max-width: 100%;
        border-radius: 8px;
      }
    }
  }

  .button-widget {
    button {
      padding: 10px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: #45a049;
      }
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
    }
  }
}
</style>
