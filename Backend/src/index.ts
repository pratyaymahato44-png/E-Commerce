import "dotenv/config"
import express from "express"

const app = express()

app.listen(8000, () => {
    console.log("server is running on Port 8000");
    
})