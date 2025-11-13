import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DemoPaymentPage() {
  const { payload, totalAmount } = useLocation().state;

  const navigate = useNavigate();

  const startDemoPayment = () => {
    console.log(payload)
    navigate(`/payment/confirmation`, { state: payload });
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-6">
      <Card className="shadow-lg border border-gray-200 rounded-xl">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-600 w-7 h-7" />
            <div>
              <CardTitle className="text-2xl font-semibold">
                Demo Payment
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete a simulated secure payment for this order.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount Section */}
          <div className="p-4 rounded-xl border bg-gray-50">
            <h3 className="text-sm font-medium text-gray-600">Order Total</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-semibold text-gray-900">
                ₹{totalAmount}
              </span>

              <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                Demo Mode
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={startDemoPayment}
            className="w-full text-md py-5 bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            {"Pay Securely (Demo)"}
          </Button>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            This will open a simulated payment gateway. No real money is charged
            — this demo mimics a real payment flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
