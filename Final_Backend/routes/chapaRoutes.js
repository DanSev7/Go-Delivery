const  express = require("express");
const {
  initiatePayment,
  webhookclient,
} = require("../controllers/chapaController.js");
// import { verifyToken } from "../middleware/verifyTokenMiddleware.js";

const router = express.Router();

// router.post("/api/pay", verifyToken, initiatePayment);
router.post("/api/pay", initiatePayment);
// router.get('/api/verify-payment/:id', verifyPayment);
// router.post("/webhook", verifyToken, webhookclient);
router.post("/webhook", webhookclient);

module.exports = router;

