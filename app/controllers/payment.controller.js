const env = require("dotenv").config({ path: "./.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
});
exports.pay = async (req, res) => {
    const amount = req.query.amount;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "INR",
            amount: parseInt(amount * 100),
            automatic_payment_methods: { enabled: true },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
}

exports.key = async (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
}
