// app/admin/products/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Package,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Flag,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    category: 'all',
  });
  const [actionDialog, setActionDialog] = useState({
    open: false,
    product: null,
    action: null,
  });
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchProducts();
  }, [session, filters, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'all' && { category: filters.category }),
      });

      const res = await fetch(`/api/admin/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (product, action) => {
    if (['suspend', 'flag', 'delete'].includes(action)) {
      setActionDialog({ open: true, product, action });
    } else {
      executeAction(product._id, action);
    }
  };

  const executeAction = async (productId, action) => {
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: actionReason }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Product ${action}ed successfully`,
        });
        setActionDialog({ open: false, product: null, action: null });
        setActionReason('');
        fetchProducts();
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} product`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (product) => {
    if (product.flagged) {
      return <Badge variant="destructive">Flagged</Badge>;
    }
    if (product.status === 'suspended') {
      return <Badge variant="secondary">Suspended</Badge>;
    }
    if (product.stock < 10) {
      return <Badge variant="outline" className="text-orange-600">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-6 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">
              Manage all products on the platform
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
              
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="lowstock">Low Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchProducts} variant="default">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Products ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Image
                        src={product.images?.[0] || "/image.png"}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{product.title}</h3>
                          {getStatusBadge(product)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By {product.ownerName || product.owner?.storename}
                        </p>
                        <div className="flex items-center gap-4 text-sm mt-1">
                          <span>R {product.price}</span>
                          <span>•</span>
                          <span>Stock: {product.stock}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                        </div>
                        {product.flagged && (
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {product.flagReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product._id}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/admin/products/${product._id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      {product.flagged ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAction(product, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(product, 'flag')}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      )}

                      {product.status !== 'suspended' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(product, 'suspend')}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAction(product, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(product, 'delete')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => !processing && setActionDialog({ ...actionDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.action === 'delete' ? 'Delete' : actionDialog.action === 'suspend' ? 'Suspend' : 'Flag'} Product
              </DialogTitle>
              <DialogDescription>
                {actionDialog.action === 'delete' 
                  ? 'This action cannot be undone. This will permanently delete the product.'
                  : 'Please provide a reason for this action.'}
              </DialogDescription>
            </DialogHeader>
            {actionDialog.action !== 'delete' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: false, product: null, action: null })}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant={actionDialog.action === 'delete' ? 'destructive' : 'default'}
                onClick={() => executeAction(actionDialog.product?._id, actionDialog.action)}
                disabled={processing || (actionDialog.action !== 'delete' && !actionReason)}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 