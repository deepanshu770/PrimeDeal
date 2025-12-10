import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Loader2, Users, ShoppingCart, DollarSign, Store } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("all");

  const [summary, setSummary] = useState<any>({});
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topShops, setTopShops] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [shopWise, setShopWise] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      setShops(data.shops || []);

      const d = data.dashboard || data;
      setSummary(d.summary || {});
      setTopProducts(d.topProducts || []);
      setTopShops(d.topShops || []);
      setRecentOrders(d.recentOrders || []);
      setShopWise(d.shopWise || []);

      if (data.shops.length) setSelectedShopId(String(data.shops[0].id));
    } catch (err) {
      console.log(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const selectedShop =
    selectedShopId === "all"
      ? null
      : shopWise.find((s) => s.shopId === Number(selectedShopId));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">Admin Dashboard</h1>

        <div className="flex gap-3">
          {/* Shop Selector */}
          <Select onValueChange={(v) => setSelectedShopId(v)} value={selectedShopId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shops</SelectItem>
              {shops.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={loadDashboard} className="gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Refresh
          </Button>
        </div>
      </div>

      {loading ? <DashboardSkeleton /> : (
        <>
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KpiCard
              icon={<ShoppingCart className="text-brandOrange" />}
              title="Total Orders"
              value={summary.totalOrders}
              subtitle={`Pending: ${summary.pendingOrders} • Delivered: ${summary.deliveredOrders}`}
            />
            <KpiCard
              icon={<DollarSign className="text-brandGreen" />}
              title="Total Revenue"
              value={`₹ ${summary.totalRevenue}`}
              subtitle={`Today: ₹${summary.todayRevenue}`}
            />
            <KpiCard
              icon={<Store className="text-brandOrange" />}
              title="Today Orders"
              value={summary.todayOrders}
              subtitle="Active today"
            />
            <KpiCard
              icon={<Users className="text-brandGreen" />}
              title="Cancelled Orders"
              value={summary.cancelledOrders}
              subtitle="Customer cancelled"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Revenue Trend List */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border rounded-lg">
                      <span className="font-medium">Day {i + 1}</span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₹ {(summary.totalRevenue / 7).toFixed(0)}</span>
                        {i % 2 === 0 ? (
                          <ArrowUp className="text-green-600 w-4 h-4" />
                        ) : (
                          <ArrowDown className="text-red-600 w-4 h-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Shops / Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedShop ? "Top Products (Selected Shop)" : "Top Shops by Revenue"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedShop
                    ? selectedShop.topProducts?.map((p: any) => (
                        <RankItem key={p.productId} name={p.product?.name} value={p.quantitySold} />
                      ))
                    : topShops.map((s: any) => (
                        <RankItem key={s.shopId} name={s.shop?.storeName} value={s.revenue} />
                      ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Top Selling Products */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((p: any) => (
                  <div
                    key={p.productId}
                    className="flex justify-between border p-3 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{p.product?.name}</h3>
                      <p className="text-sm text-gray-500">Sold: {p.quantitySold}</p>
                    </div>
                    <Badge className="bg-brandGreen text-white">
                      #{p.productId}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell>{o.shop?.storeName}</TableCell>
                      <TableCell>{o.user?.fullname}</TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.orderStatus === "delivered"
                              ? "bg-green-600"
                              : "bg-brandOrange"
                          }
                        >
                          {o.orderStatus}
                        </Badge>
                      </TableCell>

                      <TableCell>₹ {o.totalAmount}</TableCell>
                      <TableCell>
                        {new Date(o.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/* -------------------- COMPONENTS --------------------- */

function KpiCard({ icon, title, value, subtitle }: any) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-sm">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function RankItem({ name, value }: any) {
  return (
    <div className="border p-3 rounded-lg flex justify-between">
      <span>{name}</span>
      <Badge className="bg-brandGreen text-white">{value}</Badge>
    </div>
  );
}

/* Skeleton loader */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
