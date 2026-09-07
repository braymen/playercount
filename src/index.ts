import express, { Request, Response } from 'express'

const port = Number(process.env.PORT ?? 3000)

const app = express()

app.use(express.json())

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})
