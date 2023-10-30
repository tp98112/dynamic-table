/**
 * 获取指定字符串在指定字体大小下所占据的实际宽度
 * @param {string} text - 要计算宽度的字符串
 * @param {string} fontSize - 字体大小，例如 "14px"
 * @returns {number} 字符串占据的实际宽度（以像素为单位）
 */
export function getTextWidth(text, fontSize) {
  if(['string', 'number'].indexOf(typeof text) > -1){
    // 创建一个 span 元素
    const span = document.createElement("span");
    // 设置 span 的样式
    span.style.fontSize = fontSize + 'px';
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.top = "-9999px";
    span.style.left = "-9999px";
    // 设置 span 的文本内容
    span.innerText = text;
    // 将 span 插入到页面中
    document.body.appendChild(span);
    // 获取 span 的实际宽度
    const width = span.offsetWidth;
    // 移除 span
    document.body.removeChild(span);
    // 返回实际宽度
    return width;
  }else{
    return 0;
  }
}

/**
 * 获取在指定数据总量, 分页大小和下标下, 该条数据所在的页码
 * @param {number} total 
 * @param {number} pageSize 
 * @param {number} index 
 * @returns {number}
 */
export function getPageNumber(total, pageSize, index) {
    if (pageSize <= 0 || index < 0 || total <= 0) {
        return -1; // 错误的输入参数
    }

    const totalPages = Math.ceil(total / pageSize); // 总页数

    if (typeof index === 'undefined') {
        return totalPages; // 没有提供数据下标，返回总页数
    }

    if (index >= total) {
        return totalPages; // 超出数据范围，返回最后一页
    }

    return Math.floor(index / pageSize) + 1; // 返回该数据所在的页码
}
/**
 * 指定次数迭代
 */
export function iterateNTimes(n, callback) {
    for (let i = 0; i < n; i++) {
        callback(i);
    }
}
export function isEmpty(value){
    return value === '' || value === null ||  value === undefined || value.length === 0;
}
/**
 * 递归遍历数组执行
 * @data 遍历的数组
 * @execute 回调函数
 * @parent 父级数据
 * 
 */
export function recursiveTraverse(data, execute, parent){
    let loop = (arr, parent) => {
        arr.forEach((item, index) => {
            execute(item, index, parent)
            if(item.children && item.children.length){
                loop(item.children, item);
            }
        })
    }
    loop(data, parent)
}
/**
 *  同 recursiveTraverse
 *  使用some遍历方法 可在回调函数返回true时跳出循环
 */ 
export function recursiveTraverseBySome(data, execute, parent){
    let loop = (arr, parent) => {
        return arr.some((item, index) => {
            if(execute(item, index, parent)){
                return true;
            }else if(item.children && item.children.length){
                return loop(item.children, item);
            }
        })
    }
    loop(data, parent)
}
/**
 * 深拷贝
 */
export function deepClone(target, map = new Map()){
    // 基本数据类型直接返回
    if(target instanceof Date){
        // 时间类型直接返回
        return target;
    }
    if(target instanceof File){
        // 文件类型直接返回
        return target;
    }
    if(target === null){
        return target;
    }
    if(typeof target !== 'object'){
        return target;
    }
    // 引用数据类型 数组/对象
    const temp = Array.isArray(target) ? [] : {};
    if(map.get(target)){
        // 已存在则直接返回
        return map.get(target)
    }
    map.set(target, temp)
    for(const key in target){
        temp[key] = deepClone(target[key], map)
    }
    return temp;
}
// 获取随机id
export function getId(param) {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return param ? S4() : (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
/**
 * 获取字段数据类型
 */
export function getFieldType(field) {
    let type = Object.prototype.toString.call(field)
    return type.substring(8, type.length - 1)
}

/**
 * 时间格式化
 */
export function dateFormat(date, fmt = 'YYYY-mm-dd HH:MM:SS') {
    let ret;
    if(date){
        date = new Date(date)
    }else{
        date = new Date()
    }
    const opt = {
        'Y+': date.getFullYear().toString(), // 年
        'm+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'H+': date.getHours().toString(), // 时
        'M+': date.getMinutes().toString(), // 分
        'S+': date.getSeconds().toString() // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    }
    for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
        };
    };
    return fmt
}