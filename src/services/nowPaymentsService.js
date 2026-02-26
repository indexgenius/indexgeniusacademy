const API_KEY = import.meta.env.VITE_NOWPAYMENTS_API_KEY;
const ENV = import.meta.env.VITE_NOWPAYMENTS_ENV || 'sandbox';

const API_URL = ENV === 'sandbox'
    ? 'https://api-sandbox.nowpayments.io/v1'
    : 'https://api.nowpayments.io/v1';

/**
 * Service to handle NOWPayments integration
 */
export const nowPaymentsService = {
    /**
     * Create a payment invoice
     * @param {Object} data - Payment details
     * @returns {Promise<Object>} - Invoice details including invoice_url
     */
    async createInvoice(data) {
        try {
            const response = await fetch(`${API_URL}/invoice`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price_amount: data.price_amount,
                    price_currency: 'usd',
                    order_id: data.order_id,
                    order_description: data.order_description,
                    ipn_callback_url: data.ipn_callback_url || 'https://ingenusfx.com/api/callback/nowpayments',
                    success_url: data.success_url || window.location.origin,
                    cancel_url: data.cancel_url || window.location.origin,
                    is_fee_paid_by_user: true, // User pays the fee
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error creating invoice');
            }

            return await response.json();
        } catch (error) {
            console.error('NowPayments createInvoice error:', error);
            throw error;
        }
    },

    /**
     * Get payment status
     * @param {string} paymentId - The ID of the payment
     * @returns {Promise<Object>} - Payment status details
     */
    async getPaymentStatus(paymentId) {
        try {
            const response = await fetch(`${API_URL}/payment/${paymentId}`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error fetching status');
            }

            return await response.json();
        } catch (error) {
            console.error('NowPayments getPaymentStatus error:', error);
            throw error;
        }
    },

    /**
     * Get minimum payment amount
     * @param {string} currencyFrom - Source currency (e.g., 'usd')
     * @param {string} currencyTo - Destination crypto (e.g., 'btc')
     * @returns {Promise<Object>}
     */
    async getMinimumAmount(currencyFrom = 'usd', currencyTo = 'usdttrc20') {
        try {
            const response = await fetch(`${API_URL}/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('NowPayments getMinimumAmount error:', error);
            throw error;
        }
    },

    /**
     * Create a direct payment (White Label)
     * @param {Object} data - Payment details (price_amount, price_currency, pay_currency)
     */
    async createPayment(data) {
        try {
            const response = await fetch(`${API_URL}/payment`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price_amount: data.price_amount,
                    price_currency: 'usd',
                    pay_currency: data.pay_currency,
                    order_id: data.order_id,
                    order_description: data.order_description,
                    ipn_callback_url: data.ipn_callback_url || 'https://ingenusfx.com/api/callback/nowpayments',
                    is_fee_paid_by_user: true, // User pays the fee
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error creating payment');
            }

            return await response.json();
        } catch (error) {
            console.error('NowPayments createPayment error:', error);
            throw error;
        }
    },

    /**
     * Get available currencies
     */
    async getCurrencies() {
        try {
            const response = await fetch(`${API_URL}/currencies`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('NowPayments getCurrencies error:', error);
            throw error;
        }
    }
};
