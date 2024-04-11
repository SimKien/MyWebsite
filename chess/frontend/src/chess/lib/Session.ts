import { Signal } from "@preact/signals-react";
import { User } from "chess/lib/constants/UserConstants";
import { defaultUser } from "chess/lib/constants/ContextConstants";
import { getNewUser } from "chess/lib/communication/api";
import { UserInformation } from "chess/lib/constants/CommunicationConstants";
import { UserMetaStore } from "chess/lib/storage/UserStorage";


// This class is used to manage the user session, it is used to keep track of the current user and their session information (e.g. token).
// It forns the basis of the UserContext in the frontend, which is used to provide the current user information to the rest of the application.
export class Session {
    user: Signal<User>;
    userStore!: UserMetaStore                                                               //Set in the initSession method which is part of the object initialization

    constructor(user: Signal<User>) {
        this.user = user;
        this.user.value.valid = false
    }

    async initSession(userStore: UserMetaStore) {                                           //Part of the object initialization process
        this.userStore = userStore
        await this.fetchStoredUser()
    }

    async isCurrentUserValid() {
        let userInformation: UserInformation = {
            id: this.user.value.userId,
            token: this.user.value.token
        }
        let valid = false
        userInformation                                                                     //TODO: remove later
        //await getIsValid(userInformation).then((res) => { valid = res.valid })            //TODO: currently disabled, enable later
        return valid
    }

    async createUser() {
        let userInfo = await getNewUser();
        this.user.value = { userId: userInfo.id, token: userInfo.token, valid: true }

        this.storeCurrentUser()
    }

    //logout = set current user to default user which is not valid
    logOut() {
        this.user.value = defaultUser

        this.storeCurrentUser()
    }

    async storeCurrentUser() {
        this.userStore.setUserId(this.user.value.userId)
        this.userStore.setToken(this.user.value.token)
        this.userStore.setValid(this.user.value.valid)
    }

    async fetchStoredUser() {
        if (!this.userStore.valid) {
            if (await this.isCurrentUserValid()) {
                this.user.value.valid = true
            }
            return
        }

        this.user.value = { userId: this.userStore.userId, token: this.userStore.token, valid: false }

        if (await this.isCurrentUserValid()) {
            this.user.value.valid = true
        }
    }
}