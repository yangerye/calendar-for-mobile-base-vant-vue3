# calendar-for-mobile-base-vant-vue3
Vue3 日历选择器组件，**支持范围选择**、** 禁用日期**。

```bash
# 安装
npm install calendar-for-mobile-base-vant-vue3

# 配置
```bash
showDatePicker: {
  type: Boolean,
  default: false
}
inline: {
    type: Boolean,
    default: false
}
minDate: {
    type: Date,
    default: () => new Date(2020, 0, 1)
}
maxDate: {
    type: Date,
    default: () => new Date(2030, 11, 31)
}
defaultRange: {
    type: Array,
    default: null
}
showRange: {
    type: Boolean,
    default: true
}
allowPastDates: {
    type: Boolean,
    default: false
}
showCollapseToggle: {
    type: Boolean,
    default: false
}
popupTitle: {
    type: String,
    default: '日期选择'
}

# 使用
```
<script setup>
import { ref } from 'vue'
import CalendarPicker from '@corp/calendar-picker'

const selectedDate = ref(new Date())
const disabledDays = [0, 6] // 禁用周六日
</script>

<template>
  <CalendarPicker 
    v-model="selectedDate"
    :disabledDays="disabledDays"
  />
</template>
