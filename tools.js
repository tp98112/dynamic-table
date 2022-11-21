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
export function loopThroughTheArray(data, execute, parent){
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
 *  同 loopThroughTheArray
 *  使用some遍历方法 可在回调函数返回true时跳出循环
 */ 
export function loopThroughTheArrayBySome(data, execute, parent){
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