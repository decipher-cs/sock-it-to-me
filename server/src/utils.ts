import fs from 'fs/promises'
import { User } from './index.js'

interface Message {
    userID: string
    content: string
    to: string
}

const SESSION = './server/sessionStore.json'
const MESSAGE = './server/messageStore.json'
const sessionStore: User[] = await fs.readFile(SESSION, { encoding: 'utf8' }).then(utfData => JSON.parse(utfData))
const messageStore: Message[] = await fs.readFile(MESSAGE, { encoding: 'utf8' }).then(utfData => JSON.parse(utfData))

// console.log('json data:', sessionStore)

export const randomID = (len?: 36) => crypto.randomUUID().slice(len)

export const findUserWithSessionID = (sessionID: string) => {
    const user = sessionStore.find(data => data.sessionID === sessionID)
    return user
}

export const findMessageWithUserID = (userID: string) => {
    const message = messageStore.find(data => data.userID === userID)
    return message
}

export const findMessageForUserID = (userID: string) => {
    const messages = messageStore.filter(data => data.to === userID)
    return messages
}

export const writeToSessionID = async () => {
    await fs.writeFile(SESSION, JSON.stringify(sessionStore))
}

export const writeToMessage = async () => {
    await fs.writeFile(MESSAGE, JSON.stringify(messageStore))
}

export const addNewUser = async (username: string, sessionID: string, userID: string) => {
    sessionStore.push({ username, sessionID, userID })
    console.log(sessionStore)
    writeToSessionID()
}

export const addNewMessage = async (userID: string, content: string, to: string) => {
    messageStore.push({ userID, content, to })
    writeToMessage()
}
