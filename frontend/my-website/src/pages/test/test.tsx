import "pages/test/test.css";
import { useEffect, useRef } from "react";

export default function Test() {
    const containerref = useRef<HTMLDivElement>(null);
    const boxref = useRef<HTMLDivElement>(null);

    const isClicked = useRef<boolean>(false);

    const coords = useRef<{
        startx: number,
        starty: number,
        lastx: number,
        lasty: number
    }>({
        startx: 0,
        starty: 0,
        lastx: 0,
        lasty: 0
    });

    useEffect(() => {
        if (!containerref.current || !boxref.current) return;

        const container = containerref.current;
        const box = boxref.current;

        const onMouseDown = (e: MouseEvent) => {
            isClicked.current = true;
            coords.current.startx = e.clientX;
            coords.current.starty = e.clientY;
        };

        const onMouseUp = (e: MouseEvent) => {
            isClicked.current = false;
            coords.current.lastx = box.offsetLeft;
            coords.current.lasty = box.offsetTop;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isClicked.current) return;
            const nextx = e.clientX - coords.current.startx + coords.current.lastx;
            const nexty = e.clientY - coords.current.starty + coords.current.lasty;
            box.style.left = `${nextx}px`;
            box.style.top = `${nexty}px`;
        };

        box.addEventListener("mousedown", onMouseDown);
        box.addEventListener("mouseup", onMouseUp);
        container.addEventListener("mousemove", onMouseMove);

        const cleanup = () => {
            box.removeEventListener("mousedown", onMouseDown);
            box.removeEventListener("mouseup", onMouseUp);
            container.removeEventListener("mousemove", onMouseMove);
        }

        return cleanup;
    }, []);

    return (
        <div ref={containerref} className="testmainbox">
            <div className="testcontainer">
                <div ref={boxref} className="testbox"></div>
            </div>
        </div>
    );
}