import { Signal } from "@preact/signals-react";
import { User } from "chess/lib/constants/UserConstants";
import { getIsValid, getNewUser } from "chess/lib/communication/api";
import { UserInformation } from "chess/lib/constants/CommunicationConstants";
import { UserMetaStore } from "chess/lib/storage/UserStorage";
import { defaultUser } from "chess/lib/constants/ContextConstants";


// This class is used to manage the user session, it is used to keep track of the current user and their session information (e.g. token).
// It forns the basis of the UserContext in the frontend, which is used to provide the current user information to the rest of the application.
export class Session {
    user: Signal<User>;
    userStore!: UserMetaStore                                                               //Set in the initSession method which is part of the object initialization
    abortController: AbortController;

    constructor(user: Signal<User>) {
        this.user = user;
        this.user.value.valid = false
        this.abortController = new AbortController()
    }

    async initSession(userStore: UserMetaStore) {                                           //Part of the object initialization process
        this.userStore = userStore
        await this.fetchStoredUser()
    }

    async isUserValid(user: User) {
        let userInformation: UserInformation = {
            id: user.userId,
            token: user.token
        }
        let valid = false
        try {
            let response = await getIsValid(userInformation, this.abortController)
            valid = response.data.valid
        } catch (error) {
            console.log(error)
        }
        return valid
    }

    //login = check current stored user und use this one or get new user from server and set current user to new user, reload to reset the application
    async logIn() {
        if (this.user.value.valid) return

        if (await this.isUserValid(this.user.value)) {                                                  //if the user in store from earlier is already/still valid then no need to get a new user
            this.user.value = { userId: this.user.value.userId, token: this.user.value.token, valid: true }
        } else {
            try {
                let userInfo = await getNewUser(this.abortController);
                this.user.value = { userId: userInfo.data.id, token: userInfo.data.token, valid: true }
            } catch (error) {
                console.log(error)
            }
        }

        this.storeCurrentUser()
        this.user.value = defaultUser                                   //reset the user to default user so the context is reset for initial render
        location.reload()
    }

    //logout = set current user to not valid, reload to reset the application
    logOut() {
        if (!this.user.value.valid) return

        this.user.value = { userId: this.user.value.userId, token: this.user.value.token, valid: false }

        this.storeCurrentUser()
        this.user.value = defaultUser                                   //reset the user to default user so the context is reset for initial render
        location.reload()
    }

    async storeCurrentUser() {
        this.userStore.setUserId(this.user.value.userId)
        this.userStore.setToken(this.user.value.token)
        this.userStore.setValid(this.user.value.valid)
    }

    async fetchStoredUser() {
        let user = { userId: this.userStore.userId, token: this.userStore.token, valid: false }
        
        if (!this.userStore.valid) {                                                            //if valid is false in store then the user is logged out and stays logged out
            this.user.value = user
            return
        }

        if (await this.isUserValid(user)) {                                                     //if valid is true in store then check if the user is still valid and log in
            user.valid = true
            this.user.value = user
            return
        }
        this.user.value = user
        this.storeCurrentUser()                                                                  //if the user is not valid anymore then save logged out state
    }

    closeSession() {
        this.abortController.abort()
    }
}