import app from "./server.js";

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Сервер на ${PORT}`));
