const spawn = require('child_process').spawn,
    path = require('path'),
    EventEmitter = require('events'),
    net = require('net');

class PythonModule {
    constructor (pyregister, module, filename) {
        this._pyregister = pyregister;
        this._module = module;
        this._filename = filename;
        this._pyregister._send({
            command: 'import',
            filename: filename
        });
    }

    get (target, name) {
        return function() {
            return 'hello world';
        }
    }

    set (obj, prop, value) {

    }
}

class PythonRegister extends EventEmitter {
    constructor (opts = {}) {
        super();
        this._opts = opts;
        this._file = path.join(__dirname, 'python.py');
        this._shutdownBind = () => {
            this.unregister();
            process.exit();
        };
    }

    _handleStdData (type, data) {
        data = data.toString('utf8');
        console[type](data);
        this.emit('console', data);
    }

    _handleExit () {
        const isRegistered = this.isRegistered();
        this.unregister();
        if (isRegistered) {
            throw new Error('The python process was terminated premeturely.');
        }
    }

    _send (data) {
        this._socket.write(JSON.stringify(data));
    }

    _compile (module, filename) {
        try {
            const mod = new PythonModule(this, module, filename);
            module.exports = new Proxy(mod, mod);
        }
        catch (e) {
            e.message = `${filename}: ${e.message}`;
            throw e;
        }
    }

    register () {
        if (this._registered || require.extensions['.py']) {
            throw new Error('Only one require extension can be registered for ".py".');
        }
        this._registered = true;
        require.extensions['.py'] = this._compile.bind(this);
        process.on('exit', this._shutdownBind);
        this._server = net.createServer(socket => this._socket = socket);
        this._server.listen(this._opts.port || 6183, '127.0.0.1')
        this._child = spawn(this._opts.bin || 'python', ['-u', this._file], {
            detached: true,
            stdio: 'pipe'
        });
        this._child.stdout.on('data', this._handleStdData.bind(this, 'log'));
        this._child.stderr.on('data', this._handleStdData.bind(this, 'error'));
        this._child.on('exit', this._handleExit.bind(this));
        this._child.unref();
    }

    unregister () {
        if (!this._registered || !require.extensions['.py']) {
            throw new Error('This require extension does not appear to be registered.');
        }
        this._registered = false;
        delete require.extensions['.py'];
        process.removeListener('exit', this._shutdownBind);
        this._child.stdout.removeAllListeners();
        this._child.stderr.removeAllListeners();
        this._child.removeAllListeners();
        this._child.kill('SIGINT');
        this._child = null;
        this._socket = null;
        this._server.close();
    }

    isRegistered () {
        return this._registered;
    }
}

module.exports = opts => new PythonRegister(opts);
