import importlib
import time

while True:
    time.sleep(1000)

class PythonImportServer:
    def __init__(self):
        self.importCache = {}

    def requirePython(self, name):
        self.importCache[name] = importlib.import_module(name)
        return self.importCache[name]
