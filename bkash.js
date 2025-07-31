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

    console.log({
      username: config.username,
      password: config.password,
      app_key: config.app_key,
      app_secret: config.app_secret,
    })

    console.log(response.data)
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
    authorization: id_token,
    "x-app-key": config.app_key,
  }

  const body = {
    mode: "0011",
    payerReference: "017XXXXXXXX", // test phone or customer ID
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

module.exports = {
  createPayment,
}
