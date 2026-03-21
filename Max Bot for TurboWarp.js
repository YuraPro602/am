class MaxBotExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.socket = null;
        this.isConnected = false;
    }

    getInfo() {
        return {
            id: 'maxbot',
            name: 'Max Bot',
            blocks: [
                {
                    opcode: 'connectToMax',
                    blockType: Scratch.BlockType.COMMAND,
            text: 'подключиться к Max по адресу [ADDRESS]',
            arguments: {
                ADDRESS: {
                    type: Scratch.ArgumentType.STRING,
            defaultValue: 'ws://localhost:8080'
                }
            },
            color: '#ff6b00'
        },
        {
            opcode: 'sendChatMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: 'отправить в чат Max сообщение [MESSAGE]',
            arguments: {
                MESSAGE: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: 'Привет, бот!'
                }
            },
            color: '#00a86b'
        },
        {
            opcode: 'sendMusicToMax',
            blockType: Scratch.BlockType.COMMAND,
            text: 'отправить музыку в Max: [MUSIC_URL]',
            arguments: {
                MUSIC_URL: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: 'https://example.com/sound.mp3'
                }
            },
            color: '#4a86e8'
        },
        {
            opcode: 'sendPhotoToMax',
            blockType: Scratch.BlockType.COMMAND,
            text: 'отправить фото в Max: [PHOTO_URL]',
            arguments: {
                PHOTO_URL: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: 'https://example.com/image.jpg'
                }
            },
            color: '#9e0059'
        },
        {
            opcode: 'createButtonInMax',
            blockType: Scratch.BlockType.COMMAND,
            text: 'создать кнопку в Max с текстом [BUTTON_TEXT], цветом [BUTTON_COLOR] и командой [BUTTON_COMMAND]',
            arguments: {
                BUTTON_TEXT: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: 'Моя кнопка'
                },
                BUTTON_COLOR: {
            type: Scratch.ArgumentType.COLOR,
            defaultValue: '#4a86e8'
                },
                BUTTON_COMMAND: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: 'play_sound'
                }
            },
            color: '#e69138'
        },
        {
            opcode: 'isConnectedToMax',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'подключено к Max?',
            color: '#6a6a6a'
        }
            ],
            menus: {}
        };
    }

    connectToMax(args) {
        const address = args.ADDRESS;

        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(address);
        this.isConnected = false;

        this.socket.onopen = () => {
            this.isConnected = true;
            console.log('Подключено к Max:', address);
        };

        this.socket.onclose = () => {
            this.isConnected = false;
            console.log('Соединение с Max закрыто');
        };

        this.socket.onerror = (error) => {
            console.error('Ошибка соединения:', error);
            this.isConnected = false;
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'bot_reply' && data.content) {
                    console.log('Ответ бота:', data.content);
                }
            } catch (e) {
                console.warn('Не удалось разобрать сообщение от Max:', event.data);
            }
        };
    }

    sendChatMessage(args) {
        if (!this.isConnected || !this.socket) {
            console.warn('Не подключено к Max');
            return;
        }

        const message = args.MESSAGE;
        this.socket.send(JSON.stringify({
            type: 'text',
            content: message,
            from: 'scratch'
        }));
        console.log('Отправлено в чат:', message);
    }

    sendMusicToMax(args) {
        if (!this.isConnected || !this.socket) {
            console.warn('Не подключено к Max');
            return;
        }

        const url = args.MUSIC_URL;
        this.socket.send(JSON.stringify({
            type: 'music',
            url: url
        }));
        console.log('Отправлена музыка:', url);
    }

    sendPhotoToMax(args) {
        if (!this.isConnected || !this.socket) {
            console.warn('Не подключено к Max');
            return;
        }

        const url = args.PHOTO_URL;
        this.socket.send(JSON.stringify({
            type: 'photo',
            url: url
        }));
        console.log('Отправлено фото:', url);
    }

    createButtonInMax(args) {
        if (!this.isConnected || !this.socket) {
            console.warn('Не подключено к Max');
            return;
        }

        const buttonData = {
            type: 'create_button',
            button: {
                text: args.BUTTON_TEXT,
                color: args.BUTTON_COLOR,
                command: args.BUTTON_COMMAND
            }
        };

        this.socket.send(JSON.stringify(buttonData));
        console.log('Создана кнопка в Max:', args.BUTTON_TEXT);
    }

    isConnectedToMax() {
        return this.isConnected;
    }
}

// Регистрация расширения
Scratch.extensions.register(new MaxBotExtension());
