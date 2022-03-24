// component/date-time-picker/date-time-picker.js
var minInfo = {},
  maxInfo = {},
  currentInfo = {},
  limitFlagInfo = {},
  defaultInfo = {
    // 默认极限值
    limitInfo: {
      minM: 1,
      maxM: 12,
      minD: 1,
      maxD: 31,
      minH: 0,
      maxH: 23,
      minI: 0,
      maxI: 59,
    },
    // 大月
    bigDaysMonth: [1, 3, 5, 7, 8, 10, 12],
    // 天数
    daysInfo: {
      isBigMonth: 31,
      isLitMonth: 30,
      isLeapYearFeb: 29,
      isCommonYearFeb: 28
    }
  }

Component({
  properties: {
    showPickerTimeFlag: {
      type: Boolean,
      value: false
    },
    minTime: {
      type: Number,
      value: new Date().getTime()
    },
    maxTime: {
      type: Number,
      value: new Date().getTime()
    },
    defaultTime: {
      type: Number,
      value: new Date().getTime()
    }
  },

  data: {
    rangeList: [],
    indexList: []
  },
  observers: {
    showPickerTimeFlag() {
      this.checkCondition()
    }
  },
  lifetimes: {
    // attached() {
    //   this.checkCondition()
    // }
  },
  methods: {
    // 校验已知条件
    checkCondition() {
      let minTime = this.data.minTime
      let maxTime = this.data.maxTime
      let currentTime = this.data.defaultTime

      if (maxTime - minTime < 0) {
        console.error('可选范围参数有误')
      } else if (currentTime - minTime < 0 || currentTime - maxTime > 0) {
        console.error('默认时间不在可选范围内')
      } else {
        this.getCondition()
      }
    },

    // 更改列 调用对应数据处理函数
    onColumnChange(e) {
      let typeFns = ['setYear', 'setMonth', 'setDay', 'setHour', 'setMin']
      let typeIndex = e.detail.column
      let index = e.detail.value
      let rangeList = this.data.rangeList
      this[typeFns[typeIndex]](rangeList[typeIndex][index])
    },

    setYear(value = currentInfo.y) {
      let info = this.getInfo('y', value)
      // 设定范围及当前值位置
      let scope = this.getScopeArr(info.min, info.max)
      let index = scope.indexOf(value)

      // 配置极限值
      limitFlagInfo.yIsMin = info.isMin
      limitFlagInfo.yIsMax = info.isMax
      this.setData({
        'rangeList[0]': scope,
        'indexList[0]': index
      })
      this.setMonth()
    },

    setMonth(value = currentInfo.m) {
      let limitInfo = defaultInfo.limitInfo
      let info = this.getInfo('m', value)
      let upperLimit = this.getUpperLimit('m')

      // 设定范围及当前值位置
      let scopeMin = upperLimit.isMin ? info.min : limitInfo.minM
      let scopeMax = upperLimit.isMax ? info.max : limitInfo.maxM
      let scope = this.getScopeArr(scopeMin, scopeMax)
      let index = scope.indexOf(value)

      // 是否在范围内
      let inScopeObj = this.checkInScope('m', index, value, scope, info.min, info.max, info.isMin, info.isMax)
      index = inScopeObj.index

      // 配置极限值
      limitFlagInfo.mIsMin = inScopeObj.isMin
      limitFlagInfo.mIsMax = inScopeObj.isMax

      this.setData({
        'rangeList[1]': scope,
        'indexList[1]': index,
      })
      this.setDay()
    },

    setDay(value = currentInfo.d) {
      let limitInfo = defaultInfo.limitInfo
      let info = this.getInfo('d', value)
      let upperLimit = this.getUpperLimit('d')

      // 获取天数
      let days = this.getDays(currentInfo.y, currentInfo.m)

      // 设定范围及当前值位置
      let scopeMin = upperLimit.isMin ? info.min : limitInfo.minD
      let scopeMax = upperLimit.isMax ? info.max : days
      let scope = this.getScopeArr(scopeMin, scopeMax)
      let index = scope.indexOf(value)

      // 是否在范围内
      let inScopeObj = this.checkInScope('d', index, value, scope, info.min, info.max, info.isMin, info.isMax)
      index = inScopeObj.index

      // 配置极限值
      limitFlagInfo.dIsMin = inScopeObj.isMin
      limitFlagInfo.dIsMax = inScopeObj.isMax

      this.setData({
        'rangeList[2]': scope,
        'indexList[2]': index
      })
      this.setHour()

    },

    setHour(value = currentInfo.h) {
      let limitInfo = defaultInfo.limitInfo
      let info = this.getInfo('h', value)
      let upperLimit = this.getUpperLimit('h')

      // 设定范围及当前值位置
      let scopeMin = upperLimit.isMin ? info.min : limitInfo.minH
      let scopeMax = upperLimit.isMax ? info.max : limitInfo.maxH
      let scope = this.getScopeArr(scopeMin, scopeMax)
      let index = scope.indexOf(value)

      // 是否在范围外
      let inScopeObj = this.checkInScope('h', index, value, scope, info.min, info.max, info.isMin, info.isMax)
      index = inScopeObj.index

      // 配置极限值
      limitFlagInfo.hIsMin = inScopeObj.isMin
      limitFlagInfo.hIsMax = inScopeObj.isMax
      this.setData({
        'rangeList[3]': scope,
        'indexList[3]': index
      })
      this.setMin()
    },

    setMin(value = currentInfo.i) {
      let limitInfo = defaultInfo.limitInfo
      let info = this.getInfo('i', value)
      let upperLimit = this.getUpperLimit('i')

      // 设定范围及当前值位置
      let scopeMin = upperLimit.isMin ? info.min : limitInfo.minI
      let scopeMax = upperLimit.isMax ? info.max : limitInfo.maxI
      let scope = this.getScopeArr(scopeMin, scopeMax)
      let index = scope.indexOf(value)

      // 是否在范围内
      let inScopeObj = this.checkInScope('i', index, value, scope, info.min, info.max, info.isMin, info.isMax)
      index = inScopeObj.index

      // 配置极限值
      limitFlagInfo.iIsMin = inScopeObj.isMin
      limitFlagInfo.iIsMax = inScopeObj.isMax
      this.setData({
        'rangeList[4]': scope,
        'indexList[4]': index
      })
    },

    // 确定选项
    onChange(e) {
      let indexArr = e.detail.value
      let rangeList = this.data.rangeList
      let time
      let arr = rangeList.map((typeArr, index) => {
        let value = typeArr[indexArr[index]]
        return value
      })
      time = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]).getTime()
      this.triggerEvent('confirm', time)
    },

    // 取消
    onCancel(e) {
      this.triggerEvent('cancel')
    },

    // 获取已知条件值
    getCondition() {
      minInfo = this.getTimeInfo(this.data.minTime)
      maxInfo = this.getTimeInfo(this.data.maxTime)
      currentInfo = this.getTimeInfo(this.data.defaultTime)

      // 默认配置
      this.setYear()
    },

    // 设置当前值与极限值
    getInfo(key, val) {
      currentInfo[key] = val

      let value = Number(val)
      let min = Number(minInfo[key])
      let max = Number(maxInfo[key])

      return {
        min: min,
        max: max,
        isMin: value === min,
        isMax: value === max
      }
    },

    // 获取上层极限值情况
    getUpperLimit(key) {
      let arr = ['y', 'm', 'd', 'h', 'i']
      let max = arr.indexOf(key)

      // 当前key的上级极限值组合
      let upperMinArr = []
      let upperMaxArr = []

      for (let i = 0; i < max; i++) {
        upperMinArr.push(
          limitFlagInfo[`${arr[i]}IsMin`]
        )
        upperMaxArr.push(
          limitFlagInfo[`${arr[i]}IsMax`]
        )
      }

      // 上层极限值全为与关系
      let minAndRelation = upperMinArr.every(item => !!item)
      let maxAndRelation = upperMaxArr.every(item => !!item)

      return {
        isMin: minAndRelation,
        isMax: maxAndRelation
      }
    },

    // 范围变化导致当前值不在范围内，则小取最小，大取最大，并校验极限值
    checkInScope(key, index, value, scope, min, max, isMin, isMax) {
      let newIsMin = isMin
      let newIsMax = isMax
      let newIndex = index

      if (index === -1) {
        newIndex = Number(value) < Number(scope[0]) ? 0 : scope.length - 1
        currentInfo[key] = scope[newIndex]
        newIsMin = Number(scope[newIndex]) === min
        newIsMax = Number(scope[newIndex]) === max
      }

      return {
        index: newIndex,
        isMin: newIsMin,
        isMax: newIsMax
      }
    },

    // 处理天数
    getDays(year, month) {
      let y = Number(year)
      let m = Number(month)
      let bigDaysMonth = defaultInfo.bigDaysMonth
      let daysInfo = defaultInfo.daysInfo
      let days = 0

      if (m === 2) {
        // 2月 闰年29天 平年28天
        days = (y % 4 == 0 && y % 100 !== 0 || y % 400 == 0) ? daysInfo.isLeapYearFeb : daysInfo.isCommonYearFeb
      } else if (bigDaysMonth.includes(m)) {
        // 大月31天
        days = daysInfo.isBigMonth
      } else {
        // 小月30天
        days = daysInfo.isLitMonth
      }

      return days
    },

    // 获取时间详情
    getTimeInfo(stamp) {
      let time = new Date(stamp)
      let obj = {
        y: time.getFullYear() + '',
        m: this.setZero(time.getMonth() + 1),
        d: this.setZero(time.getDate()),
        h: this.setZero(time.getHours()),
        i: this.setZero(time.getMinutes())
      }
      return obj
    },

    // 获取数据范围
    getScopeArr(min, max) {
      let arr = []
      for (let i = Number(min); i <= Number(max); i++) {
        let str = this.setZero(i)
        arr.push(str)
      }
      return arr
    },

    // 补零
    setZero(value) {
      return Number(value) < 10 ? '0' + value : String(value)
    }
  }
})