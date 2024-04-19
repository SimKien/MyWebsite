export enum FieldPages {
    MultiplayerGame = "multiplayergame",
    Start = "",
    Invalid = "invalid",
}

export function getFieldPage(input: string): FieldPages {
    switch (input) {
        case FieldPages.MultiplayerGame:
            return FieldPages.MultiplayerGame;
        case FieldPages.Start:
            return FieldPages.Start;
        default:
            return FieldPages.Invalid;
    }
}
