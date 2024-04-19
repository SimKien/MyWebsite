export default function OptionBar(props: {turnboardHandler: () => void}) {
    return (
        <div className="optionbar_main">
            <button className="optionbar_item">Surrender</button>
            <button className="optionbar_item">Draw</button>
            <button className="optionbar_item" onClick={props.turnboardHandler}>Turn Board</button>
        </div>
    );
}