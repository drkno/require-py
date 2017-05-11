try:
    import __builtin__ as builtins
except:
    import builtins

import asyncore, socket

class NodeTcpClient(asyncore.dispatcher_with_send):
    def __init__(self):
        asyncore.dispatcher.__init__(self)
        self.create_socket(socket.AF_INET, socket.SOCK_STREAM)
        self.connect(('127.0.0.1', 6183))

    def handle_close(self):
        self.close()

    def handle_read(self):
        data = '', last = False
        while last is not False and last is not None and len(last) > 0:
            last = self.recv(1024)
            data += last
        print(data)

class NodeProxyObj:
    def __init__(self, basePath):
        self.basePath
        pass

    def __getattr__(self, name):
        print('here')
        print(name)
        return 'hello world'

    def __setattr__(self):
        pass

    def __delattr__(self):
        pass

builtins.node_globals = NodeProxyObj(['global'])
builtins.console = NodeProxyObj(['console'])
builtins.process = NodeProxyObj(['process'])
