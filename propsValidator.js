export default {
  actionButtonFontSize(value){
    /**
     * 操作栏按钮的字体大小 button/link
     * 验证值必须具有 link 和 button 属性
     * link和button的值必须是number类型
     */
    if (!value.hasOwnProperty('link') || !value.hasOwnProperty('button')) {
      console.error('actionButtonFontSize must have "link" and "button" properties');
      return false;
    }

    if (typeof value.link !== 'number' || typeof value.button !== 'number') {
      console.error('The value of "link" and "button" properties in actionButtonFontSize must be a number');
      return false;
    }
    
    return true;
  }
}