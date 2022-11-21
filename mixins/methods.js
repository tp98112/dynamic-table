export default {
    methods: {
        /**
         * @toggleAllSelection
         * 用于多选表格，切换所有行的选中状态
         */
        toggleAllSelection(){
            this.$refs.dynamicTable.toggleAllSelection();
        },
        /**
         * @toggleRowSelection
         * 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
         */
        toggleRowSelection(row, selected){
            this.$refs.dynamicTable.toggleRowSelection(row, selected)
        },
        /**
         * @clearSelection
         * 用于多选表格，清空用户的选择
         */
        clearSelection(){
            this.$refs.dynamicTable.clearSelection()
        },
        /**
         * @setCurrentRow
         * 用于单选表格，设定某一行为选中行，如果调用时不加参数，则会取消目前高亮行的选中状态。
         */
        setCurrentRow(row){
            this.$refs.dynamicTable.setCurrentRow(row)
        },
        /**
         * @doLayout
         * 对 Table 进行重新布局。当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法
         */
        doLayout(){
            this.$refs.dynamicTable.doLayout()
        }
    }
}