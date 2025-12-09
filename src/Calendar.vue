<template>
    <!-- inline模式：直接平铺显示 -->
    <div v-if="inline" class="date-range-picker inline-mode">
        <div class="calendar-container">
            <div class="calendar-header">
                <van-icon name="arrow-left" @click="(showCollapseToggle && isCollapsed) ? prevPeriod() : prevMonth()" />
                <span class="current-month">{{ (showCollapseToggle && isCollapsed) ? currentPeriodText :
                    currentMonthText }}</span>
                <van-icon name="arrow" @click="(showCollapseToggle && isCollapsed) ? nextPeriod() : nextMonth()" />
            </div>

            <div class="calendar-body">
                <div class="weekdays">
                    <div class="weekday">日</div>
                    <div class="weekday">一</div>
                    <div class="weekday">二</div>
                    <div class="weekday">三</div>
                    <div class="weekday">四</div>
                    <div class="weekday">五</div>
                    <div class="weekday">六</div>
                </div>

                <div class="days" :class="{ 'collapsed': showCollapseToggle && isCollapsed }">
                    <div v-for="(day, index) in displayDays" :key="index" class="day-cell" :class="{
                        'other-month': !day.isCurrentMonth,
                        'selected': day.isSelected,
                        'in-range': day.isInRange,
                        'range-start': day.isRangeStart,
                        'range-end': day.isRangeEnd,
                        'disabled': !day.isClickable
                    }" @click="handleDayClick(day)">
                        <span class="day-text">{{ day.day }}</span>
                    </div>
                </div>
            </div>

            <!-- 折叠展开按钮 -->
            <div v-if="showCollapseToggle" class="collapse-control">
                <div class="collapse-toggle" @click="toggleCollapse" :title="isCollapsed ? '展开月视图' : '折叠到周视图'">
                    <van-icon :name="isCollapsed ? 'arrow-down' : 'arrow-up'" />
                    <span class="toggle-text">{{ isCollapsed ? '展开' : '折叠' }}</span>
                </div>
            </div>
        </div>

        <!-- 快捷选择 -->
        <div class="quick-select">
            <div class="quick-title">快捷选择</div>
            <div class="quick-buttons">
                <div class="quick-btn" @click="handleQuickSelect('month')">本月</div>
                <div class="quick-btn" @click="handleQuickSelect('lastHalfYear')">上半年</div>
                <div class="quick-btn" @click="handleQuickSelect('nextHalfYear')">下半年</div>
                <div class="quick-btn" @click="handleQuickSelect('year')">全年</div>
                <div class="quick-btn" @click="handleQuickSelect('q1')">一季度</div>
                <div class="quick-btn" @click="handleQuickSelect('q2')">二季度</div>
                <div class="quick-btn" @click="handleQuickSelect('q3')">三季度</div>
                <div class="quick-btn" @click="handleQuickSelect('q4')">四季度</div>
            </div>
            <div v-if="showRange" class="selected-range">
                选择日期范围：<span class="range-text">{{ displayRange }}</span>
            </div>
        </div>
    </div>

    <!-- popup模式：弹窗显示 -->
    <van-popup v-else v-model:show="visible" position="bottom"
        :style="{ height: popupHeight, maxHeight: '95vh', ...dynamicStyles }" @closed="handleClosed">
        <div class="date-range-picker responsive-scale">
            <div class="picker-header">
                <span class="header-cancel" @click="handleCancel">取消</span>
                <span class="header-title">{{ popupTitle }}</span>
                <span class="header-confirm" @click="handleConfirm"
                    style="pointer-events: auto; cursor: pointer; z-index: 999;">确定</span>
            </div>

            <div class="calendar-container">
                <div class="calendar-header">
                    <van-icon name="arrow-left" @click="prevMonth" />
                    <span class="current-month">{{ currentMonthText }}</span>
                    <van-icon name="arrow" @click="nextMonth" />
                </div>

                <div class="calendar-body">
                    <div class="weekdays">
                        <div class="weekday">日</div>
                        <div class="weekday">一</div>
                        <div class="weekday">二</div>
                        <div class="weekday">三</div>
                        <div class="weekday">四</div>
                        <div class="weekday">五</div>
                        <div class="weekday">六</div>
                    </div>

                    <div class="days">
                        <div v-for="(day, index) in calendarDays" :key="index" class="day-cell" :class="{
                            'other-month': !day.isCurrentMonth,
                            'selected': day.isSelected,
                            'in-range': day.isInRange,
                            'range-start': day.isRangeStart,
                            'range-end': day.isRangeEnd,
                            'disabled': !day.isClickable
                        }" @click="handleDayClick(day)">
                            <slot name="day" :day="day">
                                <span class="day-text">{{ day.day }}</span>
                            </slot>
                            <!-- <span v-if="day.isRangeStart" class="range-label">开始</span>
                            <span v-if="day.isRangeEnd && !day.isRangeStart" class="range-label">结束</span> -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 快捷选择 -->
            <div class="quick-select">
                <div class="quick-title">快捷选择</div>
                <div class="quick-buttons">
                    <div class="quick-btn" @click="handleQuickSelect('month')">本月</div>
                    <div class="quick-btn" @click="handleQuickSelect('lastHalfYear')">上半年</div>
                    <div class="quick-btn" @click="handleQuickSelect('nextHalfYear')">下半年</div>
                    <div class="quick-btn" @click="handleQuickSelect('year')">全年</div>
                    <div class="quick-btn" @click="handleQuickSelect('q1')">一季度</div>
                    <div class="quick-btn" @click="handleQuickSelect('q2')">二季度</div>
                    <div class="quick-btn" @click="handleQuickSelect('q3')">三季度</div>
                    <div class="quick-btn" @click="handleQuickSelect('q4')">四季度</div>
                </div>
                <div v-if="showRange" class="selected-range">
                    选择日期范围：<span class="range-text">{{ displayRange }}</span>
                </div>
            </div>
        </div>
    </van-popup>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 计算屏幕缩放比例
const screenScale = computed(() => {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth
    const screenHeight = window.innerHeight || document.documentElement.clientHeight

    // 基准尺寸：iPhone 12 (390×844)
    const baseWidth = 390
    const baseHeight = 844

    // 计算宽度和高度的缩放比例
    const widthScale = screenWidth / baseWidth
    const heightScale = screenHeight / baseHeight

    // 使用较小的缩放比例，确保内容不会超出屏幕
    const scale = Math.min(widthScale, heightScale)

    // 限制缩放范围，避免过小或过大
    return Math.max(0.7, Math.min(1.2, scale))
})

// 计算弹窗高度
const popupHeight = computed(() => {
    const screenHeight = window.innerHeight || document.documentElement.clientHeight
    const scale = screenScale.value

    // 基础内容高度（基于iPhone 12尺寸）
    const baseContentHeight = 580
    const scaledContentHeight = baseContentHeight * scale

    // 根据屏幕高度和缩放后的内容高度决定最终高度
    if (screenHeight <= 667) {
        // 小屏设备使用全屏
        return '100%'
    } else if (scaledContentHeight >= screenHeight * 0.9) {
        // 如果缩放后的内容接近屏幕高度，使用90%
        return '90%'
    } else {
        // 使用缩放后的固定高度
        return Math.min(scaledContentHeight, screenHeight * 0.85) + 'px'
    }
})

// 计算动态样式
const dynamicStyles = computed(() => {
    const scale = screenScale.value

    return {
        '--scale-factor': scale,
        '--font-scale': Math.max(0.8, scale),
        '--spacing-scale': scale,
        '--day-cell-size': `${36 * scale}px`,
        '--quick-btn-height': `${32 * scale}px`
    }
})

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    inline: {
        type: Boolean,
        default: false
    },
    minDate: {
        type: Date,
        default: () => new Date(2020, 0, 1)
    },
    maxDate: {
        type: Date,
        default: () => new Date(2030, 11, 31)
    },
    defaultRange: {
        type: Array,
        default: null
    },
    showRange: {
        type: Boolean,
        default: true
    },
    allowPastDates: {
        type: Boolean,
        default: false
    },
    showCollapseToggle: {
        type: Boolean,
        default: false
    },
    popupTitle: {
        type: String,
        default: '日期选择'
    }
})

const emit = defineEmits(['update:show', 'confirm', 'change', 'month-change'])

const visible = computed({
    get: () => props.show,
    set: (val) => emit('update:show', val)
})

const currentMonth = ref(new Date())
const selectedRange = ref([null, null])
const tempRange = ref([null, null])

// 折叠展开相关
const isCollapsed = ref(false)
const currentWeekStart = ref(new Date())

// 注意：触摸滑动相关数据已移除，以确保不干扰页面滚动

const currentMonthText = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth() + 1
    return `${year}年${month}月`
})

// 当前周期文本（折叠模式下显示）
const currentPeriodText = computed(() => {
    const startDate = currentWeekStart.value
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    const formatDate = (date) => {
        return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getFullYear()}年${formatDate(startDate)}-${endDate.getDate()}日`
    } else {
        return `${formatDate(startDate)}-${formatDate(endDate)}`
    }
})

// 显示的日期数据（根据折叠状态决定）
const displayDays = computed(() => {
    if (props.showCollapseToggle && isCollapsed.value) {
        return getCurrentWeekDays()
    } else {
        return calendarDays.value
    }
})

const displayRange = computed(() => {
    if (!tempRange.value[0] || !tempRange.value[1]) {
        return ''
    }
    const formatDate = (date) => {
        return `${date.getMonth() + 1}月${date.getDate()}日`
    }
    return `${formatDate(tempRange.value[0])}-${formatDate(tempRange.value[1])}`
})

// 判断日期是否可在日历面板中选择（不影响快捷选择）
const isDateClickable = (date) => {
    // 如果允许选择历史日期，则所有日期都可点击
    if (props.allowPastDates) {
        return true
    }

    // 不允许选择历史日期时，检查是否早于今天
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    return targetDate >= today
}

const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()

    const firstDay = new Date(year, month, 1)
    const firstDayWeek = firstDay.getDay()
    const lastDay = new Date(year, month + 1, 0)
    const lastDayDate = lastDay.getDate()

    const days = []

    // 补充上月日期
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayWeek - 1; i >= 0; i--) {
        days.push({
            day: prevMonthLastDay - i,
            date: new Date(year, month - 1, prevMonthLastDay - i),
            isCurrentMonth: false
        })
    }

    // 当月日期
    for (let i = 1; i <= lastDayDate; i++) {
        days.push({
            day: i,
            date: new Date(year, month, i),
            isCurrentMonth: true
        })
    }

    // 补充下月日期
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            day: i,
            date: new Date(year, month + 1, i),
            isCurrentMonth: false
        })
    }
    return days.map(day => {
        const dayTime = day.date.getTime()
        const startTime = tempRange.value[0]?.getTime()
        const endTime = tempRange.value[1]?.getTime()
        const clickable = isDateClickable(day.date)

        return {
            ...day,
            isSelected: startTime === dayTime || endTime === dayTime,
            isRangeStart: startTime === dayTime,
            isRangeEnd: endTime === dayTime,
            isInRange: startTime && endTime && dayTime > startTime && dayTime < endTime,
            isClickable: clickable
        }
    })
})

const prevMonth = () => {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
    emit('month-change', currentMonth.value)
}

const nextMonth = () => {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
    emit('month-change', currentMonth.value)
}

const handleDayClick = (day) => {
    // 检查日期是否可在日历面板中点击
    if (!day.isClickable) {
        return
    }

    // 点击其他月份日期时切换月份
    if (!day.isCurrentMonth) {
        currentMonth.value = new Date(day.date.getFullYear(), day.date.getMonth(), 1)
        emit('month-change', currentMonth.value)
    }

    if (!tempRange.value[0] || (tempRange.value[0] && tempRange.value[1])) {
        tempRange.value = [day.date, null]
    } else {
        if (day.date < tempRange.value[0]) {
            tempRange.value = [day.date, tempRange.value[0]]
        } else {
            tempRange.value = [tempRange.value[0], day.date]
        }
    }

    // 触发 change 事件，传递当前选择的日期范围
    emit('change', tempRange.value)
}

const handleQuickSelect = (type) => {
    const now = new Date()
    const year = now.getFullYear()
    let start, end

    switch (type) {
        case 'month':
            start = new Date(year, now.getMonth(), 1)
            end = new Date(year, now.getMonth() + 1, 0)
            break
        case 'lastHalfYear':
            start = new Date(year, 0, 1)
            end = new Date(year, 5, 30)
            break
        case 'nextHalfYear':
            start = new Date(year, 6, 1)
            end = new Date(year, 11, 31)
            break
        case 'year':
            start = new Date(year, 0, 1)
            end = new Date(year, 11, 31)
            break
        case 'q1':
            start = new Date(year, 0, 1)
            end = new Date(year, 2, 31)
            break
        case 'q2':
            start = new Date(year, 3, 1)
            end = new Date(year, 5, 30)
            break
        case 'q3':
            start = new Date(year, 6, 1)
            end = new Date(year, 8, 30)
            break
        case 'q4':
            start = new Date(year, 9, 1)
            end = new Date(year, 11, 31)
            break
    }

    tempRange.value = [start, end]
    // 切换到开始月份
    currentMonth.value = new Date(start.getFullYear(), start.getMonth(), 1)

    // 触发 change 事件
    emit('change', tempRange.value)
}

const handleCancel = () => {
    visible.value = false
}

const handleConfirm = () => {
    try {
        console.log('=== handleConfirm START ===')
        console.log('tempRange.value:', tempRange.value)
        console.log('tempRange.value[0]:', tempRange.value[0])
        console.log('tempRange.value[1]:', tempRange.value[1])
        console.log('Condition check:', !!(tempRange.value[0] && tempRange.value[1]))

        if (tempRange.value[0] && tempRange.value[1]) {
            console.log('Condition passed, proceeding...')
            selectedRange.value = [...tempRange.value]
            console.log('selectedRange set:', selectedRange.value)

            const formatDate = (date) => {
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
            }
            const rangeText = `${formatDate(tempRange.value[0])} - ${formatDate(tempRange.value[1])}`
            console.log('rangeText:', rangeText)

            console.log('About to emit confirm...')
            emit('confirm', { range: tempRange.value, text: rangeText })
            console.log('Emit completed')

            console.log('Setting visible to false...')
            visible.value = false
            console.log('visible set to false')
        } else {
            console.log('tempRange validation failed:', tempRange.value)
        }
        console.log('=== handleConfirm END ===')
    } catch (error) {
        console.error('Error in handleConfirm:', error)
    }
}

// 测试点击事件
const testClick = () => {
    console.log('Test click works!')
}

const handleClosed = () => {
    if (!selectedRange.value[0]) {
        tempRange.value = [null, null]
    }
}

// 折叠展开相关方法
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    if (isCollapsed.value) {
        // 切换到折叠模式时，如果有选中的日期，定位到选中日期所在的周
        if (tempRange.value[0]) {
            updateCurrentWeekStartToDate(tempRange.value[0])
        } else {
            updateCurrentWeekStart()
        }
    } else {
        // 切换到展开模式时，如果有选中的日期，定位到选中日期所在的月
        if (tempRange.value[0]) {
            currentMonth.value = new Date(tempRange.value[0].getFullYear(), tempRange.value[0].getMonth(), 1)
        }
    }
}

const updateCurrentWeekStart = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = 周日, 1 = 周一, ..., 6 = 周六
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek) // 设置为本周周日
    currentWeekStart.value = startOfWeek
}

const updateCurrentWeekStartToDate = (targetDate) => {
    const dayOfWeek = targetDate.getDay() // 0 = 周日, 1 = 周一, ..., 6 = 周六
    const startOfWeek = new Date(targetDate)
    startOfWeek.setDate(targetDate.getDate() - dayOfWeek) // 设置为目标日期所在周的周日
    currentWeekStart.value = startOfWeek
}

const getCurrentWeekDays = () => {
    const days = []
    const startDate = new Date(currentWeekStart.value)

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        // 使用与calendarDays相同的逻辑来计算日期状态
        const dayTime = date.getTime()
        const startTime = tempRange.value[0]?.getTime()
        const endTime = tempRange.value[1]?.getTime()

        const dayData = {
            date: date,
            day: date.getDate(),
            isCurrentMonth: date.getMonth() === currentMonth.value.getMonth(),
            isSelected: startTime === dayTime || endTime === dayTime,
            isRangeStart: startTime === dayTime,
            isRangeEnd: endTime === dayTime,
            isInRange: startTime && endTime && dayTime > startTime && dayTime < endTime,
            isClickable: isDateClickable(date)
        }

        days.push(dayData)
    }

    return days
}

const prevPeriod = () => {
    if (isCollapsed.value) {
        // 折叠模式：切换到上一周
        const newWeekStart = new Date(currentWeekStart.value)
        newWeekStart.setDate(currentWeekStart.value.getDate() - 7)
        currentWeekStart.value = newWeekStart

        // 如果跨月了，更新当前月份
        const weekMiddle = new Date(newWeekStart)
        weekMiddle.setDate(newWeekStart.getDate() + 3)
        if (weekMiddle.getMonth() !== currentMonth.value.getMonth()) {
            currentMonth.value = new Date(weekMiddle.getFullYear(), weekMiddle.getMonth(), 1)
        }
    }
}

const nextPeriod = () => {
    if (isCollapsed.value) {
        // 折叠模式：切换到下一周
        const newWeekStart = new Date(currentWeekStart.value)
        newWeekStart.setDate(currentWeekStart.value.getDate() + 7)
        currentWeekStart.value = newWeekStart

        // 如果跨月了，更新当前月份
        const weekMiddle = new Date(newWeekStart)
        weekMiddle.setDate(newWeekStart.getDate() + 3)
        if (weekMiddle.getMonth() !== currentMonth.value.getMonth()) {
            currentMonth.value = new Date(weekMiddle.getFullYear(), weekMiddle.getMonth(), 1)
        }
    }
}

// 注意：触摸滑动功能已移除，以确保不干扰页面滚动

watch(() => props.show, (val) => {
    if (val) {
        if (props.defaultRange && props.defaultRange.length === 2) {
            tempRange.value = [...props.defaultRange]
            selectedRange.value = [...props.defaultRange]
            currentMonth.value = new Date(props.defaultRange[0].getFullYear(), props.defaultRange[0].getMonth(), 1)
        } else {
            tempRange.value = [null, null]
            selectedRange.value = [null, null]
            currentMonth.value = new Date()
        }
    }
})

// 初始化
onMounted(() => {
    updateCurrentWeekStart()
})
</script>

<style lang="less" scoped>
.date-range-picker {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;

    &.inline-mode {
        height: auto;
        flex: none;
        overflow: visible;
    }

    &.responsive-scale {
        /* 使用CSS变量进行响应式缩放 */
        font-size: calc(14px * var(--font-scale, 1));

        /* 确保缩放时保持布局稳定 */
        transform-origin: top center;
    }

    .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #f0f2f7;
        flex-shrink: 0;

        .header-cancel,
        .header-confirm {
            font-size: 14px;
            color: #1e50b3;
            cursor: pointer;
        }

        .header-title {
            font-size: 16px;
            font-weight: 600;
            color: #1d2c5b;
            text-align: center;
            flex: 1;
        }
    }

    .calendar-container {
        flex: 1;
        overflow-y: auto;
        padding: 0 16px;
        min-height: 0;
        /* 允许flex子元素缩小 */

        /* inline模式下不创建独立滚动容器 */
        .inline-mode & {
            flex: none;
            overflow: visible;
            min-height: auto;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            margin-bottom: 16px;
            position: relative;

            .van-icon {
                font-size: 20px;
                color: #1d2c5b;
                cursor: pointer;

                &:hover {
                    color: #1e50b3;
                }
            }

            .current-month {
                font-size: 16px;
                font-weight: 600;
                color: #1d2c5b;
                flex: 1;
                text-align: center;
            }
        }

        .collapse-control {
            padding: 12px 16px;
            display: flex;
            justify-content: center;
            border-top: 1px solid #f0f2f7;

            .collapse-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                cursor: pointer;
                border-radius: 20px;
                background: #1e50b3;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(30, 80, 179, 0.2);

                &:hover {
                    background: #1a4ba0;
                    transform: scale(1.05);
                }

                &:active {
                    transform: scale(0.95);
                }

                .van-icon {
                    font-size: 14px;
                    color: #fff;
                }

                .toggle-text {
                    font-size: 14px;
                    color: #fff;
                    font-weight: 500;
                }
            }
        }

        .calendar-body {
            padding: calc(8px * var(--spacing-scale, 1)) calc(8px * var(--spacing-scale, 1)) calc(12px * var(--spacing-scale, 1));

            /* 在小屏幕上减少内边距 */
            @media (max-height: 667px) {
                padding: calc(4px * var(--spacing-scale, 1)) calc(4px * var(--spacing-scale, 1)) calc(8px * var(--spacing-scale, 1));
            }

            .weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: calc(8px * var(--spacing-scale, 1));
                margin-bottom: calc(8px * var(--spacing-scale, 1));

                .weekday {
                    text-align: center;
                    font-size: calc(13px * var(--font-scale, 1));
                    color: #8a94ad;
                    padding: calc(8px * var(--spacing-scale, 1)) 0;
                }
            }

            .days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: calc(8px * var(--spacing-scale, 1));
                transition: all 0.3s ease;

                &.collapsed {
                    /* 折叠状态下只显示一行 */
                    grid-template-rows: 1fr;
                    overflow: hidden;

                    .day-cell {
                        /* 折叠状态下的默认日期单元格样式 */
                        border: 1px solid #f0f2f7;
                        background: #fff;

                        &.selected,
                        &.range-start,
                        &.range-end {
                            background: #1e50b3;
                            border-color: #1e50b3;

                            .day-text {
                                color: #fff;
                            }
                        }

                        &.in-range {
                            background: #e8f4ff;
                            border-color: #1e50b3;

                            .day-text {
                                color: #1e50b3;
                            }
                        }

                        /* 区间外的日期保持默认样式 */
                        &:not(.selected):not(.range-start):not(.range-end):not(.in-range) {
                            background: transparent;
                            border: none;

                            .day-text {
                                color: #1d2c5b;
                            }

                            &:hover {
                                background: #f5f7fa;
                            }

                            /* 其他月份的日期 */
                            &.other-month {
                                .day-text {
                                    color: #d0d7e3;
                                }
                            }
                        }

                        /* 禁用日期的样式 */
                        &.disabled {
                            background: #f9f9f9 !important;
                            border-color: #f0f2f7 !important;
                            cursor: not-allowed !important;

                            .day-text {
                                color: #d0d7e3 !important;
                            }

                            &:hover {
                                background: #f9f9f9 !important;
                                border-color: #f0f2f7 !important;
                            }
                        }
                    }
                }

                .day-cell {
                    aspect-ratio: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    cursor: pointer;
                    border-radius: calc(6px * var(--spacing-scale, 1));
                    width: 100%;
                    min-height: var(--day-cell-size, 36px);

                    /* 在小屏幕上减小高度 */
                    @media (max-height: 667px) {
                        min-height: calc(32px * var(--spacing-scale, 1));
                    }

                    &.other-month {
                        .day-text {
                            color: #d0d7e3;
                        }
                    }

                    &.disabled {
                        cursor: not-allowed;
                        opacity: 0.4;

                        .day-text {
                            color: #d0d7e3;
                        }

                        &:hover {
                            background: none;
                        }
                    }

                    &.in-range {
                        background: #e8f4ff;
                        border-radius: 6px;
                    }

                    &.selected,
                    &.range-start,
                    &.range-end {
                        background: #1e50b3;
                        color: #fff;
                        border-radius: 6px;

                        .day-text {
                            color: #fff;
                            font-weight: 600;
                        }
                    }

                    .day-text {
                        font-size: calc(15px * var(--font-scale, 1));
                        color: #1d2c5b;
                        font-weight: 500;
                    }

                    .range-label {
                        position: absolute;
                        bottom: 4px;
                        font-size: 9px;
                        color: #fff;
                        background: rgba(0, 0, 0, 0.2);
                        padding: 1px 4px;
                        border-radius: 4px;
                        line-height: 1;
                    }
                }
            }
        }
    }

    .quick-select {
        padding: calc(12px * var(--spacing-scale, 1)) calc(16px * var(--spacing-scale, 1));
        background: #fff;
        border-top: 1px solid #f0f2f7;
        flex-shrink: 0;

        /* 在小屏幕上减少内边距 */
        @media (max-height: 667px) {
            padding: calc(8px * var(--spacing-scale, 1)) calc(12px * var(--spacing-scale, 1));
        }

        .quick-title {
            font-size: calc(14px * var(--font-scale, 1));
            font-weight: 600;
            color: #1d2c5b;
            margin-bottom: calc(10px * var(--spacing-scale, 1));
        }

        .quick-buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: calc(8px * var(--spacing-scale, 1));
            margin-bottom: calc(12px * var(--spacing-scale, 1));

            /* 在小屏幕上减小间距 */
            @media (max-height: 667px) {
                gap: calc(6px * var(--spacing-scale, 1));
                margin-bottom: calc(8px * var(--spacing-scale, 1));
            }

            .quick-btn {
                padding: calc(8px * var(--spacing-scale, 1)) calc(12px * var(--spacing-scale, 1));
                background: #f5f7fa;
                border-radius: calc(6px * var(--spacing-scale, 1));
                font-size: calc(13px * var(--font-scale, 1));
                color: #1d2c5b;
                text-align: center;
                cursor: pointer;
                min-height: var(--quick-btn-height, 32px);
                display: flex;
                align-items: center;
                justify-content: center;

                /* 在小屏幕上减小内边距 */
                @media (max-height: 667px) {
                    padding: calc(6px * var(--spacing-scale, 1)) calc(8px * var(--spacing-scale, 1));
                    font-size: calc(12px * var(--font-scale, 1));
                }

                &:active {
                    background: #e8ecf1;
                }
            }
        }

        .selected-range {
            padding: calc(10px * var(--spacing-scale, 1));
            background-color: #f5f7fa;
            border-radius: calc(4px * var(--spacing-scale, 1));
            font-size: calc(13px * var(--font-scale, 1));
            color: #8a94ad;

            .range-text {
                color: #1e50b3;
                font-weight: 600;
            }
        }
    }
}
</style>
