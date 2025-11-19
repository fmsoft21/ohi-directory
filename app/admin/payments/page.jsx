// app/admin/payments/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const StatsCard = ({ title, value, icon: Icon, color = "emerald" }) => {
  const colorClasses = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
    red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default function AdminPaymentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filters, setFilters] = useState({ status: 'all', startDate: '', endDate: '' });
  const [actionDialog, setActionDialog] = useState({ open: false, order: null, action: null });
  const [note, setNote] = useState('');

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchPayments();
  }, [session, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters.status !== 'all' ? { status: filters.status } : {});
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/admin/payments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setStats(data.stats);
        setTotalRevenue(data.totalRevenue);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      const res = await fetch(`/api/admin/payments/${actionDialog.order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionDialog.action, note }),
      });

      if (res.ok) {
        toast({ title: "Success", description: `Payment ${actionDialog.action} successfully` });
        setActionDialog({ open: false, order: null, action: null });
        setNote('');
        fetchPayments();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process action", variant: "destructive" });
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      paid: { label: "Paid", className: "bg-green-600" },
      pending: { label: "Pending", className: "bg-yellow-600" },
      failed: { label: "Failed", className: "bg-red-600" },
      refunded: { label: "Refunded", className: "bg-gray-600" },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const statsData = [
    { title: "Total Revenue", value: `R ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "emerald" },
    { title: "Paid", value: stats.find(s => s._id === 'paid')?.count || 0, icon: CheckCircle, color: "blue" },
    { title: "Pending", value: stats.find(s => s._id === 'pending')?.count || 0, icon: AlertCircle, color: "orange" },
    { title: "Failed", value: stats.find(s => s._id === 'failed')?.count || 0, icon: XCircle, color: "red" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-6 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payments Management</h1>
            <p className="text-muted-foreground">Monitor and manage all platform payments</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {statsData.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchPayments} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">#{payment.orderNumber}</span>
                      {getPaymentStatusBadge(payment.paymentStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.buyer?.storename} → {payment.seller?.storename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold">R {payment.total.toFixed(2)}</p>
                    <div className="flex gap-2">
                      {payment.paymentStatus === 'pending' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setActionDialog({ open: true, order: payment, action: 'mark_paid' })}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {payment.paymentStatus === 'paid' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setActionDialog({ open: true, order: payment, action: 'refund' })}
                        >
                          Refund
                        </Button>
                      )}
                      <Link href={`/admin/orders/${payment._id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionDialog.action === 'mark_paid' ? 'Mark as Paid' : 'Process Refund'}</DialogTitle>
              <DialogDescription>
                {actionDialog.action === 'mark_paid'
                  ? 'Manually mark this payment as paid.'
                  : 'Process a refund for this order.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Note (optional)</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, order: null, action: null })}>Cancel</Button>
              <Button onClick={handleAction}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}