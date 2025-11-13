import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useOrderStore } from "@/zustand/useOrderStore";
import { toast } from "sonner";
import { useCartStore } from "@/zustand/useCartStore";

export default function DemoConfirmation() {
  const navigate = useNavigate();
  const { state: payload } = useLocation();
  const createOrder = useOrderStore().createOrder;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        await new Promise((res) => {
          setTimeout(() => res(1), 2000);
        });
        await createOrder(payload);
        useCartStore.getState().clearCart();
        toast.success("Order Created");
        setStatus("success");
        setTimeout(() => {
          navigate("/order");
        }, 2000);
      } catch (err) {
        console.log(err);
        setStatus("error");
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [payload]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center text-gray-600">
              <Loader2 className="h-20 w-20 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                Status: <strong>{status}</strong>
              </p>
              {status === "success" ? (
                <div className="flex gap-2">Redirecting to orders...</div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
