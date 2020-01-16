**For debugging**
in visual studio sett ```launch.json```

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Attach by Process ID",
            "processId": "${command:PickProcess}",
            "port": 9228
        }
    ]
}
```
In CMD execute ```npm install -g nodemon```

To start open cmd in .vscode folder and run ```startServer.cmd```