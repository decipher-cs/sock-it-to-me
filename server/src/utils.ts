import fs from 'fs/promises'
import { User } from './index.js'

const URL = './server/sessionStore.json'
const sessionStore: User[] = await fs.readFile(URL, { encoding: 'utf8' }).then(utfData => JSON.parse(utfData))

// console.log('json data:', sessionStore)

export const randomID = (len?: 36) => crypto.randomUUID().slice(len)

export const findUserWithSessionID = (sessionID: string) => {
    const user = sessionStore.find(data => data.sessionID === sessionID)
    return user
}

export const writeToSessionID = async () => {
    await fs.writeFile(URL, JSON.stringify(sessionStore))
}

export const addNewUser = async (username: string, sessionID: string, userID: string) => {
    sessionStore.push({ username, sessionID, userID })
    console.log(sessionStore)
    writeToSessionID()
}

// await fs.writeFile(URL)
