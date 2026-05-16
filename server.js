const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory data store
let todos = [
    { id: 1, text: '리액트 공부하기', completed: false, createdAt: Date.now() - 3000 },
    { id: 2, text: '멋진 UI 디자인 만들기', completed: true, createdAt: Date.now() - 2000 },
    { id: 3, text: '투두 리스트 완성하기', completed: false, createdAt: Date.now() - 1000 },
    { id: 4, text: '부모님댁에 전화하기', completed: false, createdAt: Date.now() }
];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send initial data to the connected client
    socket.emit('initialData', todos);

    socket.on('addTodo', (todo) => {
        todos.unshift(todo); // Add to beginning
        io.emit('todosUpdated', todos);
    });

    socket.on('toggleTodo', ({ id, completed }) => {
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: completed } : todo
        );
        io.emit('todosUpdated', todos);
    });

    socket.on('deleteTodo', (id) => {
        todos = todos.filter(todo => todo.id !== id);
        io.emit('todosUpdated', todos);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
