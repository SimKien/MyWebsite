import { WebsocketCLient as WebsocketClient } from "chess/lib/communication/Websocket";
import { WebsocketTypes } from "chess/lib/constants/WebsocketConstants";
import { Signal } from "@preact/signals-react";
import { getBoardPosition, getGame, getWebsocketUrl, getValidMoves, getDefaultBoard } from "chess/lib/communication/api";
import { convertToMoveMessage, convertToMove } from "chess/lib/communication/WSDataParser";
import { WebsocketMessage, UserInformation, SpecialMove } from "chess/lib/constants/CommunicationConstants";
import { PieceColor } from "chess/lib/constants/ChessConstants";
import { Move, PositionAbsolute} from "chess/lib/constants/BoardConstants";
import { Player, User } from "chess/lib/constants/UserConstants";

export class Game {
    user: User;
    player: Signal<Player>
    connection!: WebsocketClient;
    validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>;
    fetchedBoardPosition: Signal<string>;
    specialMoves: Signal<SpecialMove[]>;
    makeMove!: (move: Move, specialMove: SpecialMove | undefined) => void;

    constructor(fetchedBoardPosition: Signal<string>, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>, specialMoves: Signal<SpecialMove[]>,
        user: User, player: Signal<Player>) {
        this.user = user;
        this.player = player
        this.validMoves = validMoves
        this.fetchedBoardPosition = fetchedBoardPosition
        this.specialMoves = specialMoves
    }

    async generateSession(makeMove: (move: Move, specialMove: SpecialMove | undefined) => void) {
        this.makeMove = makeMove
        if (!this.user.valid) {
            await this.fetchDefaultBoardPosition()
            return
        }
        await Promise.all([this.createGame(), this.connectToWebsocket()])

        this.connection.addHandler(console.log)                                                //TODO: Evtl am Ende entfernen

        await Promise.all([this.fetchBoardPosition(), this.fetchValidMoves()])
    }

    async connectToWebsocket() {
        let userInformation: UserInformation = {
            id: this.user.userId,
            token: this.user.token
        }
        this.connection = new WebsocketClient(getWebsocketUrl(userInformation))
        this.connection.addHandler(this.receiveMove)
    }

    async createGame() {
        let userInformation: UserInformation = {
            id: this.user.userId,
            token: this.user.token
        }
        await getGame(userInformation).then((res) => {
            let newPlayer: Player = {
                user: this.user,                                                                //User wont change
                color: res.color as PieceColor
            }
            this.player.value = newPlayer
        })
    }

    async fetchDefaultBoardPosition() {
        await getDefaultBoard().then((res) => this.fetchedBoardPosition.value = res.board_position)
    }

    async fetchBoardPosition() {
        let userInformation: UserInformation = {
            id: this.user.userId,
            token: this.user.token
        }
        await getBoardPosition(userInformation).then((res) => this.fetchedBoardPosition.value = res.board_position)
    }

    async fetchValidMoves() {
        let userInformation: UserInformation = {
            id: this.user.userId,
            token: this.user.token
        }
        await getValidMoves(userInformation).then((data) => {
            this.validMoves.value = new Map<String, String[]>(Object.entries(data.valid_moves)) as Map<PositionAbsolute, PositionAbsolute[]>
            this.specialMoves.value = Array.from(data.special_moves)
        })
    }

    reportMove(move: Move, specialMove: SpecialMove | undefined) {
        let moveInfo = convertToMoveMessage(move, specialMove)

        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()         //theres no valid move when player just moved
        this.connection.send(moveInfo)
    }

    receiveMove(moveInformationString: string) {
        void this.fetchValidMoves()

        let moveInformation: WebsocketMessage
        try {
            moveInformation = JSON.parse(moveInformationString)
        } catch (e) {
            console.log(e)
            return
        }
        if (moveInformation.message_type !== WebsocketTypes.MOVE) return

        const [move, specialMove] = convertToMove(moveInformation)

        this.makeMove(move, specialMove)
    }
}