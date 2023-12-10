# Home Chat - Configuration
Server has to be provided with `.env` configuration file in order to work. Inside this file you can specify your own settings and enable some features, which are disabled on default settings. 

> You will receive an error when trying to run the server without this file

## Setup
- create `.env` file inside `api/` folder
- copy configuration from example below and paste it into `.env` file
- change specific values if necessary
- run the server and check if configuration is working

> Make sure configuration is exactly in `api/.env` and you run the server being inside the main folder

## Custom Settings
**Server |**
Address and Port, on which server will be running can be set. Address is IPv4 and port is number from `0 - 65 536`, make sure you are not using an occupied port.

**Mail |**
Email notification system - for registering an account, restoring forgotten passwords. Without this set, default verification code is `1234`. Mailing server is Gmail.

**Passwords |**
Password pepper is a text which is added when hashing passwords. It will be less secure to use it blank. You have to keep the same on throughout using the server or you will not be able to access your passwords

## Example Pepper Generation
```py
import secrets
print("Example Pepper:", secrets.token_hex(32)) 
```

## Example
```env
ADDRESS = 127.0.0.1
PORT = 5000

EMAIL = "hello@example.com"
PASSWORD = 

PEPPER = ""
```

> NOTE: Server will work perfectly fine without you changing anything