(() => {
    'use strict';
    var e = {
            767: (e, t, s) => {
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.requestListener = void 0);
                const n = s(488),
                    i = s(748),
                    r = process.argv.slice(2, 3).toString().split('=')[1],
                    o = Number('single' === r ? '3000' : '4000'),
                    a = JSON.stringify({ message: 'Invalid userId (not in uuid format)' }),
                    d = JSON.stringify({
                        message:
                            "Invalid data in request. Probably you are missing required fields or using invalid data type for object key's value or have extra fields",
                    }),
                    l = JSON.stringify({ message: 'Your body might contain errors and cannot be converted to JSON' }),
                    p = JSON.stringify({
                        message: 'Request body does not contain required fields or have extra fields',
                    }),
                    u = JSON.stringify({ message: 'Your url does not contain user ID, so user id is invalid' }),
                    c = JSON.stringify({ message: 'User with this ID was not found' }),
                    f = JSON.stringify({ message: "Resource that you requested doesn't exist" }),
                    y = JSON.stringify({ message: 'Your body is missing required fields' }),
                    g = JSON.stringify({
                        message:
                            "Resource that you requested doesn't exist or you are posting to a wrong path. You should post to localhost:3000/api/users/",
                    }),
                    w = JSON.stringify({
                        message:
                            "Resource that you requested doesn't exist or you are posting to a wrong path. You should post to 'localhost:3000/api/users/id' where id is UUID",
                    });
                t.requestListener = async function (e, t) {
                    let s = '';
                    async function r(e) {
                        try {
                            return JSON.parse(e), Promise.resolve(JSON.parse(e));
                        } catch (e) {
                            return Promise.resolve('Invalid body');
                        }
                    }
                    async function h(e) {
                        const t = ['username', 'age', 'hobbies'],
                            s = Object.keys(e);
                        return Promise.resolve(s.length === t.length && s.every((e) => t.includes(e)));
                    }
                    async function m(e) {
                        let t = e.username,
                            s = e.age,
                            n = e.hobbies;
                        'string' == typeof s && (s = s.trim()), 'string' == typeof t && (t = t.trim());
                        let i = 'string' == typeof t && 0 !== t.length,
                            r = !isNaN(Number(s)) && null !== s && 0 !== s.toString.length,
                            o = Array.isArray(n) && (n.every((e) => 'string' == typeof e) || 0 === n.length);
                        return Promise.resolve(i && r && o);
                    }
                    await new Promise((t, n) => {
                        e.on('data', (e) => {
                            s += e;
                        }),
                            e.on('end', () => {
                                t('success');
                            });
                    });
                    const H = e.method,
                        b = new URL(`http://localhost:${o}${e.url}`).pathname.split('/').filter(Boolean);
                    let x = b.length >= 3 ? b[2] : void 0,
                        v = 'api' === b[0] && 'users' === b[1];
                    const D = 2 === b.length;
                    if (b.length > 3) t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(f);
                    else if ('GET' === H)
                        if (v && D)
                            t.setHeader('Content-Type', 'application/json'),
                                t.writeHead(200),
                                t.end(JSON.stringify(i.newDb.getUsers()));
                        else if (v && x)
                            if (await (0, n.isUUID)(x)) {
                                const e = i.newDb.getUsers().find((e) => e.id === x);
                                e
                                    ? (t.setHeader('Content-Type', 'application/json'),
                                      t.writeHead(200),
                                      t.end(JSON.stringify(e)))
                                    : (t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(c));
                            } else t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(a);
                        else t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(f);
                    else if ('POST' === H)
                        if (v && D) {
                            const e = await r(s);
                            if ('Invalid body' === e)
                                t.setHeader('Content-Type', 'application/json'), t.writeHead(500), t.end(l);
                            else if (await h(e))
                                if (!1 === (await m(e)))
                                    t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(d);
                                else {
                                    let s = await (0, n.generateUUID)();
                                    const r = i.newDb.getUsers().find((e) => e.id === x);
                                    for (; r; ) s = await (0, n.generateUUID)();
                                    e.age = Number(e.age);
                                    const o = Object.assign(s, e);
                                    i.newDb.addNewUser(o),
                                        t.setHeader('Content-Type', 'application/json'),
                                        t.writeHead(201),
                                        t.end(JSON.stringify(o));
                                }
                            else t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(y);
                        } else t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(g);
                    else if ('PUT' === H)
                        if (v && D) t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(u);
                        else if (v && x)
                            if (await (0, n.isUUID)(x)) {
                                const e = i.newDb.getUsers().find((e) => e.id === x);
                                if (e) {
                                    const n = await r(s);
                                    if ('Invalid body' === n)
                                        t.setHeader('Content-Type', 'application/json'), t.writeHead(500), t.end(l);
                                    else if (await h(n))
                                        if (!1 === (await m(n)))
                                            t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(d);
                                        else {
                                            const s = { id: e.id },
                                                r = Object.assign(s, n);
                                            i.newDb.modifyUser(x, r),
                                                t.setHeader('Content-Type', 'application/json'),
                                                t.writeHead(200),
                                                t.end(JSON.stringify(r));
                                        }
                                    else t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(p);
                                } else t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(c);
                            } else t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(a);
                        else t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(g);
                    else
                        'DELETE' === H
                            ? v && D
                                ? (t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(u))
                                : v && x
                                  ? (await (0, n.isUUID)(x))
                                      ? i.newDb.getUsers().find((e) => e.id === x)
                                          ? (i.newDb.deleteUser(x),
                                            t.setHeader('Content-Type', 'application/json'),
                                            t.writeHead(204),
                                            t.end())
                                          : (t.setHeader('Content-Type', 'application/json'),
                                            t.writeHead(404),
                                            t.end(c))
                                      : (t.setHeader('Content-Type', 'application/json'), t.writeHead(400), t.end(a))
                                  : (t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(w))
                            : (t.setHeader('Content-Type', 'application/json'), t.writeHead(404), t.end(f));
                };
            },
            16: function (e, t, s) {
                var n =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 });
                const i = n(s(840)).default.worker;
                t.default = class {
                    _users = [];
                    _multicore = 0;
                    constructor(e) {
                        (this._users = []), (this._multicore = 4e3 === e ? 1 : 0);
                    }
                    addNewUser(e) {
                        this._users.push(e),
                            1 === this._multicore && i && i.send({ type: 'updateDataInDb', body: this._users });
                    }
                    getUsers() {
                        return this._users;
                    }
                    modifyUser(e, t) {
                        this._users.map((s, n) => {
                            s.id === e && (this._users[n] = t);
                        }),
                            1 === this._multicore && i && i.send({ type: 'updateDataInDb', body: this._users });
                    }
                    deleteUser(e) {
                        this._users.map((t, s) => {
                            t.id === e && this._users.splice(s, 1);
                        }),
                            1 === this._multicore && i && i.send({ type: 'updateDataInDb', body: this._users });
                    }
                    updateDb(e) {
                        this._users = e;
                    }
                };
            },
            748: function (e, t, s) {
                var n =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.newDb = void 0);
                const i = n(s(136)),
                    r = n(s(840)),
                    o = n(s(558)),
                    a = n(s(16)),
                    d = s(767),
                    l = process.argv.slice(2, 3).toString().split('=')[1],
                    p = Number('single' === l ? '3000' : '4000'),
                    u = 'localhost',
                    c = o.default.availableParallelism();
                let f = 0;
                const y = [];
                if (((t.newDb = new a.default(p)), r.default.isPrimary && 4e3 === p)) {
                    for (let e = 0; e < c; e += 1) {
                        const e = r.default.fork();
                        e.on('online', () => {
                            y.push(e);
                        }),
                            e.on('exit', (e, t, s) => {
                                const n = y.indexOf(e);
                                -1 !== n && y.splice(n, 1);
                            });
                    }
                    r.default.on('exit', () => {
                        r.default.fork();
                    });
                    const e = i.default.createServer(async (e, t) => {
                        const s = new URL(`http://${u}:${p}${e.url}`).pathname,
                            n = y[f];
                        f = (f + 1) % y.length;
                        const r = {
                                hostname: 'localhost',
                                port: p + n.id,
                                path: s,
                                method: e.method,
                                headers: e.headers,
                            },
                            o = i.default.request(r, (e) => {
                                t.writeHead(e.statusCode, e.headers), e.pipe(t);
                            });
                        e.pipe(o),
                            o.on('error', (e) => {
                                console.error('Error forwarding request:', e),
                                    (t.statusCode = 500),
                                    t.end('Internal server error');
                            });
                    });
                    r.default.on('message', (e, t) => {
                        if ('updateDataInDb' === t.type)
                            for (const e in r.default.workers) r.default.workers[e]?.send(t.body);
                    }),
                        e.listen(p, () => {
                            console.log(`Server is running on http://${u}:${p} and worker ${process.pid} is working`);
                        });
                } else {
                    const e = i.default.createServer(d.requestListener);
                    if (4e3 === p) {
                        if (
                            (process.on('message', (e) => {
                                t.newDb.updateDb(e);
                            }),
                            process && 'function' == typeof process.send)
                        ) {
                            const t = r.default.worker;
                            t &&
                                1 !== t.id &&
                                e.listen(p + t.id - 1, () => {
                                    console.log(
                                        `Server is running on http://${u}:${p + t.id - 1} and worker ${process.pid} is working`
                                    );
                                });
                        }
                    } else
                        e.listen(p, u, () => {
                            console.log(`Server is running on http://${u}:${p}`);
                        });
                }
            },
            488: (e, t) => {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.isUUID = t.generateUUID = void 0),
                    (t.generateUUID = async function () {
                        const e = {
                            id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
                                let t = (16 * Math.random()) | 0;
                                return ('x' == e ? t : (3 & t) | 8).toString(16);
                            }),
                        };
                        return Promise.resolve(e);
                    }),
                    (t.isUUID = async function (e) {
                        return Promise.resolve(
                            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
                                e
                            )
                        );
                    });
            },
            840: (e) => {
                e.exports = require('cluster');
            },
            136: (e) => {
                e.exports = require('http');
            },
            558: (e) => {
                e.exports = require('os');
            },
        },
        t = {};
    !(function s(n) {
        var i = t[n];
        if (void 0 !== i) return i.exports;
        var r = (t[n] = { exports: {} });
        return e[n].call(r.exports, r, r.exports, s), r.exports;
    })(748);
})();
