// bkash.js
const axios = require("axios")
const config = require("./bkashConfig")

async function getToken() {
  try {
    const url = `${config.baseURL}/tokenized/checkout/token/grant`
    const headers = {
      "Content-Type": "application/json",
      username: config.username,
      password: config.password,
    }

    const body = {
      app_key: config.app_key,
      app_secret: config.app_secret,
    }

    const response = await axios.post(url, body, { headers })

    return response.data.id_token
  } catch (err) {
    console.error("❌ Error getting token:", err.response?.data || err.message)
    throw new Error("Token generation failed")
  }
}

async function createPayment(amount, invoiceId) {
  const id_token = await getToken()

  const url = `${config.baseURL}/tokenized/checkout/create`
  const headers = {
    "Content-Type": "application/json",
    // Authorization: id_token,
    Authorization: `Bearer ${id_token}`,
    "x-app-key": config.app_key,
  }

  const body = {
    mode: "0011",
    payerReference: "01770618575",
    callbackURL: config.callbackURL,
    amount: amount.toString(),
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber: invoiceId,
  }

  try {
    const response = await axios.post(url, body, { headers })
    console.log("RESPONSE: ", response.data)
    return response.data
  } catch (err) {
    console.error(
      "❌ Error creating payment:",
      err.response?.data || err.message
    )
    throw new Error("Payment creation failed")
  }
}

async function executePayment(paymentID) {
  const id_token = await getToken()

  console.log("ID TOKEN", id_token)

  const url = `${config.baseURL}/tokenized/checkout/execute/${paymentID}`
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${id_token}`,
    "x-app-key": config.app_key,
  }

  try {
    const response = await axios.post(url, {}, { headers })
    console.log("Execute Payment Response:", response.data)
    if (response.data && response.data.statusCode !== "0000") {
      throw new Error("Execution failed: " + response.data.statusMessage)
    }
    return response.data
  } catch (err) {
    console.log(
      "❌ Error executing payment:",
      err.response?.data || err.message
    )
    throw new Error("Payment execution failed")
  }
}

module.exports = {
  createPayment,
  executePayment,
}
