const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const CHAPA_URL = process.env.CHAPA_URL || "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_AUTH = process.env.CHAPA_AUTH || "CHASECK_TEST-rV16Y9xjZgRJsmt8GGTxLJOLpy2cBhak"; // Ensure this is set in .env

const config = {
    headers: {
        Authorization: `Bearer ${CHAPA_AUTH}`
    }
};

// Initial payment endpoint

const initiatePayment = async (req, res) => {

    const {
        amount,
        currency,
        email,
        first_name,
        last_name,
        delivery_address
    } = req.body;

    const CALLBACK_URL = `http://localhost:${process.env.PORT || 5000}/api/chapa/verify-payment/`;
    const RETURN_URL = "http://localhost:5000/api/chapa/payment-success/";

    const TEXT_REF = "tx-myecommerce12345-" + Date.now();

    const data = {
        amount, 
        currency,
        email,
        first_name,
        last_name,
        tx_ref: TEXT_REF,
        callback_url: CALLBACK_URL + TEXT_REF,
        return_url: RETURN_URL,
        // metadata: {
        //     delivery_address: delivery_address,
        // }
    };
    console.log("Data : ", data);

    try {
        const response = await axios.post(CHAPA_URL, data, config);
        console.log("Reponse Pay : ", response.data);
        const checkout_url = response.data.data.checkout_url;
        const paymentStatus = response.data.status;
        res.json({ checkout_url, paymentStatus });
    } catch (error) {
        console.error('Error initiating payment: ', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};


const webhookclient = async (req, res) => {
    try {
      const data = req.body;
      console.log("WebHook data : ", data);
  
      const payload = {
        amount: data.amount,
        status: data.status,
        first_name: data.first_name,
      };
//       const order_id = payload.orderid;
//       const encrypted_orderid = encrypt(order_id, key, salt);
//   console.log("Encrypted Uin inside the webhooks : ", encrypted_orderid);
  
      if (payload.status === "success") {
        console.log("paymentStatus is : ", payload.status);
        // const updateOrderQuery = `
        //     UPDATE orders
        //     SET status = 'Accepted'
        //     WHERE orderid = $1;
        // `;
        // await client.query(updateOrderQuery, [encrypted_orderid]);
        console.log("payment is Successful")
      }
    //   await Payments(payload, res);
      return res.status(200).json("Payment is successfully processed")
    } catch (error) {
      console.log("Error at the webhooks : ", error.message);
    }
  };



module.exports = {initiatePayment, webhookclient};
