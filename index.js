// index.js
const express = require("express")
const cors = require("cors")
const { createPayment } = require("./bkash")

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.post("/pay", async (req, res) => {
  const { amount, invoiceId } = req.body

  if (!amount || !invoiceId) {
    return res.status(400).json({ error: "amount and invoiceId required" })
  }

  try {
    const payment = await createPayment(amount, invoiceId)

    return res.status(200).json({
      bkashURL: payment.bkashURL,
      paymentID: payment.paymentID,
      statusMessage: payment.statusMessage,
    })
  } catch (err) {
    console.error("❌ Payment error:", err.message)
    return res.status(500).json({ error: "bKash Payment Failed" })
  }
})

app.post("/callback", (req, res) => {
  console.log("REQUEST AT /callback")
  console.log(req.body)
  res.status(200).json({ message: "success" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
