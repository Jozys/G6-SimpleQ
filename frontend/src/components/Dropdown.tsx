import React from "react";
import "./Dropdown.scss";

interface Item {
    label: string,
    icon: string,
    shortcut?: string | JSX.Element,
    onClick?: () => void,
    items?: Item[]
}

interface LocalItem extends Item {
    expanded?: boolean
}

export default class Dropdown extends React.Component<{
    button: JSX.Element,
    items: Item[],
    direction?: "left" | "right"
}, { isOpen: boolean, items: LocalItem[] }> {
    constructor(props: any) {
        super(props);
        this.state = { isOpen: false, items: this.props.items };
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.items !== prevProps.items) {
            this.setState({ items: this.props.items });
        }
    }

    componentDidMount() {
        document.addEventListener("click", this.onClick());
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.onClick());
    }

    onClick() {
        return (e: any) => {
            // close dropdown when clicking outside and dropdown is open
            if (this.state.isOpen && !e.target.closest(".dropdown") && !e.target.closest(".dropdown-menu")) {
                this.setState({ isOpen: false });
            }
        }
    }

    buttonAction() {
        let items = this.state.items;
        items.forEach((item) => {
            item.expanded = false;
        });
        this.setState({ isOpen: !this.state.isOpen, items });
    }

    render() {
        return <div className={ "dropdown" + (this.state.isOpen ? " active" : "") }>
            <div className={ "dropdown-button" }
                 onClick={ () => this.buttonAction() }
                 onKeyDown={ (e: any) => {
                     if (e.key === "Enter") this.buttonAction();
                 } }>
                { this.props.button }
            </div>

            { this.state.isOpen && <>
                { this.renderItems(this.state.items, 0) }
            </> }
        </div>;
    }

    private renderItems(items: LocalItem[], level: number, topDistance?: string): JSX.Element {
        let classNameAddon = "";
        if (level === 0) classNameAddon = " " + (this.props.direction ?? "left");

        return <ul className={ "dropdown-menu" + classNameAddon } style={ { top: topDistance } }>
            { items.map((item, index) => <>
                <button key={ index }
                        className={ "dropdown-menu-item" }
                        onClick={ () => {
                            if (item.items && item.items.length > 0) {
                                items.forEach((i) => {
                                    if (i !== item) {
                                        i.expanded = false;
                                    }
                                });
                                item.expanded = !item.expanded;
                                this.setState({ items: this.state.items });
                                return;
                            }

                            if (item.onClick) {
                                item.onClick();
                            }
                            // this.setState({ isOpen: false });
                        } }>
                    <i className={ item.icon }/>

                    <span>{ item.label }</span>

                    { item.shortcut && <span className={ "shortcut" }>{ item.shortcut }</span> }

                    { (item.items && item.items.length > 0) &&
                        <i className={ "fas fa-angle-down" + (item.expanded ? " expanded" : "") }/> }
                </button>

                { item.expanded && item.items && item.items.length > 0 && this.renderItems(item.items, level + 1, (100 / items.length * index) + "%") }
            </>) }
        </ul>;
    }
}