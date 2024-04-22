import { Signal } from "@preact/signals-react";
import { User } from "chess/lib/constants/UserConstants";
import { getIsValid, getNewUser } from "chess/lib/communication/api";
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
        await getIsValid(userInformation).then((res) => { valid = res.valid })
        return valid
    }

    //login = check current stored user und use this one or get new user from server and set current user to new user
    async logIn() {
        if (this.user.value.valid) return

        if (await this.isCurrentUserValid()) {                                              //if the user in store from earlier is already/still valid then no need to get a new user
            this.user.value.valid = true
        } else {
            let userInfo = await getNewUser();
            this.user.value = { userId: userInfo.id, token: userInfo.token, valid: true }
        }

        this.storeCurrentUser()
        location.reload()
    }

    //logout = set current user to not valid
    logOut() {
        if (!this.user.value.valid) return

        this.user.value.valid = false

        this.storeCurrentUser()
        location.reload()
    }

    async storeCurrentUser() {
        this.userStore.setUserId(this.user.value.userId)
        this.userStore.setToken(this.user.value.token)
        this.userStore.setValid(this.user.value.valid)
    }

    async fetchStoredUser() {
        this.user.value = { userId: this.userStore.userId, token: this.userStore.token, valid: false }
        
        if (!this.userStore.valid) return                                                       //if valid is false in store then the user is logged out and stays logged out

        if (await this.isCurrentUserValid()) {                                                  //if valid is true in store then check if the user is still valid and log in
            this.user.value.valid = true
            return
        }
        this.storeCurrentUser()                                                                  //if the user is not valid anymore then save logged out state
    }
}