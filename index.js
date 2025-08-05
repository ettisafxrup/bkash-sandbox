// index.js
const express = require("express")
const cors = require("cors")
const { createPayment } = require("./bkash")

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.post("/pay", async (req, res) => {
  const { amount } = req.body

  const invoiceId = Date.now().toString()
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

const { executePayment } = require("./bkash") // <- Import it

app.get("/callback", async (req, res) => {
  const { paymentID, status } = req.query

  console.log("Callback hit with:", req.query)

  if (status === "success") {
    try {
      const result = await executePayment(paymentID)
      console.log("✅ Payment executed:", result)

      res.send("✅ Payment completed successfully!")
    } catch (err) {
      console.error("❌ Execution failed:", err.message)
      res.send("⚠️ Payment execution failed.")
    }
  } else {
    res.send("❌ Payment failed or canceled.")
  }
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
