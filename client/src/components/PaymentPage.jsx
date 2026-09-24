import React, { useState } from "react";

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    if (plan === "Premium") {
      setShowPayment(true);
    } else {
      setShowPayment(false);
      alert("✅ You are now on the Free plan!");
    }
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 md:px-16 py-12">
      <h1 className="text-4xl font-semibold text-gray-700 mb-3">
        Choose Your Plan
      </h1>
      <p className="text-gray-500 mb-12 text-center max-w-xl">
        Start for free and scale up as you grow. Find the perfect plan for your
        content creation needs.
      </p>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Left: Plans */}
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div
            className={`border rounded-2xl p-6 cursor-pointer transition-all ${
              selectedPlan === "Free"
                ? "border-blue-600 shadow-md"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">Free</h2>
              {selectedPlan === "Free" && (
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                  Active
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">$0</p>
            <p className="text-gray-500 mb-4">Always free</p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li>✔ Title Generation</li>
              <li>✔ Article Generation</li>
            </ul>
            <button
              onClick={() => handleSubscribe("Free")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
            >
              Subscribe
            </button>
          </div>

          {/* Premium Plan */}
          <div
            className={`border rounded-2xl p-6 cursor-pointer transition-all ${
              selectedPlan === "Premium"
                ? "border-blue-600 shadow-md"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">Premium</h2>
              {selectedPlan === "Premium" ? (
                <span className="text-sm bg-black text-white px-2 py-1 rounded-lg">
                  Active
                </span>
              ) : (
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-2">$16</p>
            <p className="text-gray-500 mb-4">per month</p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li>✔ Title Generation</li>
              <li>✔ Article Generation</li>
              <li>✔ Generate Images</li>
              <li>✔ Remove Background</li>
              <li>✔ Remove Object</li>
              <li>✔ Resume Review</li>
            </ul>
            <button
              onClick={() => handleSubscribe("Premium")}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Right: Payment Section */}
        {showPayment && (
          <div
            className="border rounded-2xl p-6 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-gray-200"
            style={{ outline: "none" }}
          >
            {!paymentSuccess ? (
              loading ? (
                <div className="flex flex-col items-center justify-center text-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-900 mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Processing payment...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Premium Plan
                  </h2>

                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Subtotal</span>
                    <span>$16.00</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-semibold mb-4">
                    <span>Total Due Today</span>
                    <span>$16.00</span>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 text-orange-700 text-center py-2 rounded-lg mb-4">
                    Development mode
                  </div>

                  <form className="space-y-3">
                    <input
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0"
                      />
                    </div>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-0">
                      <option>India</option>
                      <option>USA</option>
                      <option>UK</option>
                    </select>

                    <button
                      type="button"
                      onClick={handlePay}
                      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition mt-4"
                    >
                      Pay $16.00
                    </button>
                  </form>
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                {/* Success Animation */}
                <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                  <div className="absolute w-20 h-20 rounded-full border-4 border-gray-200 animate-ping"></div>
                  <div className="absolute w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                    <img
                      src="/success-icon.png"
                      alt="Success"
                      className="w-10 h-10"
                    />
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  Payment was successful!
                </h2>
                <p className="text-gray-500 mb-6">
                  Your Premium plan has been activated.
                </p>

                <div className="w-full text-left text-gray-600 border-t pt-4 text-sm mb-6">
                  <div className="flex justify-between mb-1">
                    <span>Total paid</span>
                    <span className="font-medium text-gray-800">$16.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment method</span>
                    <span className="font-medium text-gray-800">Visa •••• 4242</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
