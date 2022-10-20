import { CreateElement } from 'vue';
import type { Select as ElSelectType, Tree as ElTreeType } from 'element-ui';
declare const ElSelectTree_base: import("vue-class-component/lib/declarations").VueClass<object & Record<never, any> & {
    name: string;
    id: string;
    value: unknown;
    autocomplete: string;
    autoComplete: string;
    automaticDropdown: boolean;
    size: string;
    disabled: boolean;
    clearable: boolean;
    filterable: boolean;
    allowCreate: boolean;
    loading: boolean;
    popperClass: string;
    remote: boolean;
    loadingText: string;
    noMatchText: string;
    noDataText: string;
    remoteMethod: Function;
    filterMethod: Function;
    multiple: boolean;
    multipleLimit: number;
    placeholder: string;
    defaultFirstOption: boolean;
    reserveKeyword: boolean;
    valueKey: string;
    collapseTags: boolean;
    popperAppendToBody: boolean;
} & {
    data: unknown[];
    emptyText: string;
    renderAfterExpand: boolean;
    nodeKey: string;
    checkStrictly: boolean;
    defaultExpandAll: boolean;
    checkDescendants: boolean;
    autoExpandParent: boolean;
    defaultCheckedKeys: unknown[];
    defaultExpandedKeys: unknown[];
    currentNodeKey: string | number;
    renderContent: Function;
    showCheckbox: boolean;
    props: any;
    lazy: boolean;
    highlightCurrent: boolean;
    load: Function;
    accordion: boolean;
    indent: number;
    iconClass: string;
}>;
export default class ElSelectTree extends ElSelectTree_base {
    select: ElSelectType;
    tree: ElTreeType<any, any>;
    render(h: CreateElement): import("vue").VNode;
    mounted(): void;
    private get values();
    /**
     * change from current component
     * @private
     */
    private privateValue;
    onPrivateValueChange(val: any): void;
    /**
     * change from user assign value
     */
    private onValueChange;
    private _defaultExpandedKeys;
    _updateDefaultExpandedKeys(): unknown[];
    private get propsElSelect();
    private get propsElTree();
    /**
     * 禁止直接引用，通过 getValByProp 获取节点值
     */
    private get propsMixin();
    /**
     * 获取节点的 prop 对应的值
     */
    private getValByProp;
    private _renderContent;
    private _filterMethod;
    private _filterNodeMethod;
    private _nodeClick;
    private _visibleChange;
    private _check;
    private canSelect;
}
export {};
