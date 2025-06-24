const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/submissions', require('./routes/submissionRoute'))
const PORT = 5005
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
