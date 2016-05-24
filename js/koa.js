process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

import polyfill from "babel-polyfill"

const cluster = require('cluster')
import _router from 'koa-router'
const router = _router()

// middleware
import stat from 'koa-serve-static'
import conditional from 'koa-conditional-get'
import bodyParser from 'koa-bodyparser'
import Compress from 'koa-compress'
import Morgan from 'koa-morgan'
import favicon from 'koa-favicon'
import session from 'koa-session'

// adapt pre Koa 2.0 middle ware to be compatible with Koa 2.0.
import adapt from 'koa-convert'
import etag from 'koa-etag'
import koa from 'koa'
import request from 'request'
import passport from 'koa-passport'
export const app = new koa()

const logger = Morgan('combined')
import rt from 'koa-response-time'

import enforceHttps from 'koa-sslify'
const config = require('../config.json')

if(config.https){
    if(config.heroku){
        app.use(enforceHttps({
            trustProtoHeader: true
        }))
    } else {
        app.use(enforceHttps())
    }
}

//-- app.use(adapt(favicon(require.resolve('./dist/favicon.ico'))))
app.use(adapt(rt()))
app.use(adapt(conditional()))
app.use(adapt(etag()))
app.use(logger)
app.use(adapt(Compress({ flush: require('zlib').Z_SYNC_FLUSH })))
app.keys = [ Array(4).fill(true).map(x => Math.random()+'').join('') ]
app.use(adapt(session({ maxAge: 24 * 60 * 60 * 1000 }, app)))
app.use(adapt(bodyParser()))

// default proxying
const replaceRemoteTokens = (ctx,localUrl, webUrl, tokens=webUrl.match(/:(\w+)/ig)) =>
{
    var res
    if (tokens) {
        console.log('yeah')
        res = tokens.reduce((a, t) =>
            a.replace(new RegExp(t, 'ig'), ctx.params[t.substr(1)]), webUrl)
    }
    else {
        let root = localUrl.split('*')[0]
        let fullPath = ctx.req._parsedUrl.pathname
        let relPath = fullPath.split(root)[1]
        res = webUrl + relPath
    }
    return res
}

const get = (url, headers={}) =>
    new Promise((res,rej) => {
        request({
            url,
            headers: {
                'User-Agent': 'request',
                ...headers
            }
        }, (error, response, body) => {
            if(!error) { // && response.statusCode === 200
                return res(body)
            }
            return rej(error)
        })
    })

const querify = data => '?'+Object.keys(data).map(key => key+'='+data[key]).join('&')

const proxify = (router, localUrl, webUrl, headers, search) => {
    router.get(localUrl, async (ctx, next) => {
        try {
            var data = await get(replaceRemoteTokens(ctx, localUrl, webUrl) + (querify(search) || ctx.req._parsedUrl.search || ''), headers)
        } catch(e) {
            ctx.body = e
            return
        }
        ctx.body = data
    })
}

// add your proxies here.
//
// examples:
// proxify(router, '/yummly/recipes', 'http://api.yummly.com/v1/api/recipes')
// proxify(router, '/brewery/styles', 'https://api.brewerydb.com/v2/styles')
// proxify(router, '/macrofab/:r1/:r2/:r3/:r4/:r5', 'https://demo.development.macrofab.com/api/v2/:r1/:r2/:r3/:r4/:r5', {Accept: 'application/json'})

proxify(router, '/macrofab/*', 'https://demo.development.macrofab.com/api/v2/', {Accept: 'application/json'}, {apikey:process.env.apikey})

app.use(router.routes())
app.use(router.allowedMethods())
app.use(stat('dist'))