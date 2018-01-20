"use strict"

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
            debug('-CALL RETURNED ' + body)
            resolve(body)
        })
    })
}

app.get('/', async (req, res) => {
    const id = req.headers.host.split(':')[0]
    const index = abc.indexOf(id)
    debug(`+CALLED id:${id}|index:${index}`)
    let value = '$'
    let start = +new Date()
    if (index > 0) {
        value = await call(abc[index - 1])
    }
    if (process.env.TIMER) {
        let duration = +(new Date()) - start
        value += ',' + id + ':' + duration
    }
    else {
        value += ',' + id
    }
    debug('-RETURNING ' + value)
    res.send(value)
})

const server = require('http').Server(app)
server.listen(app.get('port'), async () => {
    debug('started')
})