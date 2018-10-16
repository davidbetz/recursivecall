"use strict"

process.env['DEBUG'] = process.env['DEBUG'] || 'trace'

const debug = require('debug')('trace')
const express = require("express")
const request = require('request')

const port = process.env.PORT || 3000
const app = express()
app.set('port', port)

let addressSuffix = process.env.ADDRESS_SUFFIX || ''
if(addressSuffix.length > 0) {
    addressSuffix = "." + addressSuffix
}

const abc = Array.from(Array(26).keys()).map(p => String.fromCharCode(97 + p))

const call = (address) => {
    return new Promise((resolve, reject) => {
        const uri = 'http://' + address + addressSuffix + ':' + port
        debug('+CALLING ' + uri)
        request.get(uri, async (error, response, body) => {
            debug('-CALL RETURNED ' + body)
            resolve(body)
        })
    })
}

app.get('/:id?', async (req, res) => {
    //+ if id in path, use it
    let id = req.url.substring(1)
    if(id.length != 1 ) {
        id = getId(req.hostname)
    }
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

const getId = host => {
    debug("host", host)
    let id
    //+ if . in host, use first part
    let withSuffixParts = host.split(".")
    if(withSuffixParts.length > 0) {
        id = withSuffixParts[0]
    }
    //+ if : in host, use host
    if(id.length == 0) {
        let parts = host.split(":")
        id = parts[0]
    }
    //+ if len(host) > 0, default to g
    if(id.length != 1) {
        debug("Argument length != 1. Defaulting to g.")
        id = "g"
    }
    return id
}

const check = letter => {
    return new Promise((resolve, reject) => {
        const uri = 'http://' + letter + addressSuffix + ':' + port
        debug('+CALLING ' + uri)
        request.get(uri, async (error, response, body) => {
            if(error) {
                throw new Error(error)
            }
            debug('-CALL RETURNED ' + body)
            resolve(body)
        })
    })
}

(async () => {
    const arg = process.argv[2]
    switch(arg) {
        case "check":
            await check(getId(process.argv[3]))
            break
        default:
            const server = require('http').Server(app)
            server.listen(app.get('port'), async () => {
                debug('started')
            })
    }
})()
