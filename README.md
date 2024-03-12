# Home Chat
Communication system with many features. It is based on **Discord** in terms of UI and server model. Backend is supplied by **Python** with **Flask**. Frontend was made using **React.js** and default CSS styles. Dynamic communication with server is done using **SocketIO**. This was a hobby project, which I had a lot of fun working on. You can check it out using instruction below.

> If you find any bugs or you have and propositions, feel free to create a new **issue** on this repository. 

## Requirements
- Docker
- Python 3.8 or above
- Node.js 16 or above

> NOTE: When using Docker, none of above are required except Docker itself

## Setup
```bash
python setup.py
```

> NOTE: This app needs `.env` configuration file. Checkout `api/README.md` and using that file, create `api/.env` file with your own settings. Without this, you won't be able to run the server. 
>
> If you want to run a development version run `npm run dev` instead.

## Running server
```bash
python main.py
```

## License
NOT FOR COMMERCIAL USE 

> If you intend to use any of my code for commercial use please contact me and get my permission. If you intend to make money using any of my code please ask my permission.