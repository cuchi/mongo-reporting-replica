const { MongoClient } = require('mongodb')
const { format, subSeconds } = require('date-fns')

const host = process.env.MONGO_HOST || 'localhost'
const port = process.env.MONGO_PORT || 27017
const interval = Number(process.env.INTERVAL) || 2000
const dbName = 'replica-test'

const connect = async () => {
    let tries = 10

    while (--tries) {
        try {
            const client = await MongoClient.connect(`mongodb://${host}:${port}`)
            console.log(`Connected successfully to ${host}:${port}`)
            return client.db(dbName)
        } catch (err) {
            console.error(`Could not connect: ${err.message}`)
            console.error(`tries remaining: ${tries}`)
        }
    }
}

const createIndex = async collection => {
    try {
        await collection.createIndex({ date: 1 })
    } catch (e) {
        console.warn('Index exists already, moving on...')
    }
}

const work = collection => async () => {
    const now = new Date()
    const formattedTime = format(now, 'HH:mm:ss:SSS')
    let log = ''

    await collection.insert({ date: now })
    log += `[${formattedTime}] insert\n`

    const { modifiedCount } = await collection
        .updateMany({ date: { $lt: subSeconds(now, 30) } }, { $set: { old: true } })
    log += `[${formattedTime}] update (${modifiedCount})\n`

    const { deletedCount } = await collection
        .deleteMany({ date: { $lt: subSeconds(now, 60) } })
    log += `[${formattedTime}] delete (${deletedCount})\n`

    console.log(log)
}

const run = async () => {
    const Documents = (await connect()).collection('documents')
    await createIndex(Documents)
    setInterval(work(Documents), interval)
}

run()
