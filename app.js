const debug = require('debug')('trace')
const express = require("express")
const request = require('request')

const port = process.env.PORT || 3000
const app = express()
app.set('port', port)

const abc = Array.from(Array(26).keys()).map(p => String.fromCharCode(97 + p))

const call = (address) => {
    return new Promise((resolve, reject) => {
        const uri = 'http://' + address + ':' + port
        debug('+CALLING ' + uri)
        request.get(uri, async (error, response, body) => {
            if (error) {
                reject(500)
            }
            debug('-CALL RETURNED ' + body)
            resolve(body)
        })
    })
}

app.get('/', async (req, res) => {
    let host = req.headers.host.split(':')[0]
    if (host === 'localhost') {
        host = process.env.NAME
        debug('host', host)
    }
    const id = host.substring(0, 1)
    const index = abc.indexOf(id)
    debug(`+CALLED id:${id}|index:${index}`)
    let value = '$'
    start = +new Date()
    if (index > 0) {
        try {
            value = await call(abc[index - 1])
        }
        catch (ex) {
            res
                .status(500)
                .send('Error with ' + abc[index - 1])
            return
        }
    }
    let duration = +(new Date()) - start
    value += ',' + id + ':' + duration
    debug('-RETURNING ' + value)
    res.send(value)
})

app.listen(process.env.PORT || 3000)
