(function(Scratch) {
    'use strict';

    class MaxBotExtension {
        constructor(runtime) {
            this.runtime = runtime;
            this.socket = null;
            this.isConnected = false;
            this.lastMessageId = 0;
            this.requestedMessageId = null;
            this.requestedMessageText = 'Загрузка...';
        }

        getInfo() {
            return {
                id: 'maxbot',
                name: 'Max Bot',
                extensionIconURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzkyNDBCMiIvPjx0ZXh0IHg9IjIwIiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0ibm9ybWFsIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NPC90ZXh0Pjwvc3ZnPg==',
                blockIconURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzkyNDBCMiIvPjx0ZXh0IHg9IjEyIiB5PSIxNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjktdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD48L3N2Zz4=',
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
                color: '#9240B2'
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
                color: '#9240B2'
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
                color: '#9240B2'
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
                color: '#9240B2'
            },
            {
                opcode: 'addReactionToMessage',
                blockType: Scratch.BlockType.COMMAND,
                text: 'поставить реакцию [REACTION] на сообщение [MESSAGE_ID]',
                arguments: {
            REACTION: {
                type: Scratch.ArgumentType.STRING,
                menu: 'reactionsMenu'
            },
            MESSAGE_ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
            }
                },
                color: '#9240B2'
            },
            {
                opcode: 'sendStickerToMax',
                blockType: Scratch.BlockType.COMMAND,
                text: 'отправить стикер в Max: [STICKER_URL]',
                arguments: {
            STICKER_URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com/sticker.png'
            }
                },
                color: '#9240B2'
            },
            {
                opcode: 'getLastMessageId',
                blockType: Scratch.BlockType.REPORTER,
                text: 'ID последнего сообщения',
                color: '#9240B2'
            },
            {
                opcode: 'getMessageTextById',
                blockType: Scratch.BlockType.REPORTER,
                text: 'текст сообщения с ID [MESSAGE_ID]',
                arguments: {
            MESSAGE_ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
            }
                },
                color: '#9240B2'
            },
            {
                opcode: 'isConnectedToMax',
                blockType: Scratch.BlockType.BOOLEAN,
                text: 'подключено к Max?',
                color: '#9240B2'
            }
                ],
                menus: {
            reactionsMenu: {
                items: ['👍', '❤️', '😂', '🤔', '👏', '🎉']
            }
                }
            };
        }

        connectToMax(args) {
            const address = args.ADDRESS;

            if (this.socket) {
                this.socket.close();
            }

            try {
                this.socket = new WebSocket(address);

                this.socket.onopen = () => {
                    this.isConnected = true;
            console.log('✅ Подключено к Max:', address);
                };

                this.socket.onclose = () => {
            this.isConnected = false;
            console.log('❌ Соединение с Max закрыто');
                };

                this.socket.onerror = (error) => {
            console.error('❌ Ошибка соединения:', error);
            this.isConnected = false;
                };

                this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'last_message_id') {
            this.lastMessageId = data.id;
            console.log('🆔 Получен ID последнего сообщения:', this.lastMessageId);
                }

                if (data.type === 'message_text' && data.id === this.requestedMessageId) {
            this.requestedMessageText = data.text;
            console.log('🆔 Получен текст сообщения ID', data.id, ':', data.text);
                }
            } catch (e) {
                console.warn('⚠️ Не удалось разобрать сообщение от Max:', event.data);
            }
                };
            } catch (error) {
                console.error('❌ Ошибка создания WebSocket:', error);
            }
        }

        sendChatMessage(args) {
            if (!this.isConnected || !this.socket) {
                console.warn('⚠️ Не подключено к Max');
                return;
            }

            const message = args.MESSAGE;
            this.socket.send(JSON.stringify({
                type: 'text',
                content: message,
                from: 'scratch'
            }));
            console.log('💬 Отправлено в чат:', message);
        }

        sendMusicToMax(args) {
            if (!this.isConnected || !this.socket) {
                console.warn('⚠️ Не подключено к Max');
                return;
            }

            const url = args.MUSIC_URL;
            this.socket.send(JSON.stringify({
