import * as Realm from "realm-web"

export const App = new Realm.App("discord_rss-yfjfo")

export async function getClient() {
    try {
        const credentials = Realm.Credentials.apiKey(API_KEY);
        // Attempt to authenticate
        const user = await App.logIn(credentials);
        return user.mongoClient('mongodb-atlas');
    } catch (err) {
        throw 'Error with authentication.'
    }
}

export async function getCollection(name: string) {
    const client = await getClient()
    return client.db('discord_rss').collection('potential_comics');
}