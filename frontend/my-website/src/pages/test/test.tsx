import "pages/test/test.css";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Test() {

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="testmainbox">
                <div className="testcontainer">
                    <Dragbox />
                </div>
                <Goal />
            </div>
        </DndProvider>
    );
}

function Goal() {
    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: "dragbox",
        drop: () => { },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }));

    return (
        <div ref={dropRef} className="testcontainer">
            {isOver && (<div style={{ backgroundColor: "yellow", height: "100%", width: "100%" }}></div>)}
        </div>
    )
}

function Dragbox() {
    const [, dragRef] = useDrag({
        type: "dragbox"
    })

    return <div ref={dragRef} className="testbox"></div>
}