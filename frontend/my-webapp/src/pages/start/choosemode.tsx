import "./choosemode.css";

export default function Choosemode() {
    return (
        <div className="mainBox">
            <div className="link">
                <a href="/chess">
                    <button className="linkButton">Chess</button>
                </a>
            </div>
            <div className="link">
                <a href="/test">
                    <button className="linkButton">Test</button>
                </a>
            </div>
            <div className="link">
                <a href="/tictactoe">
                    <button className="linkButton">TicTacToe</button>
                </a>
            </div>
        </div>
    );
}