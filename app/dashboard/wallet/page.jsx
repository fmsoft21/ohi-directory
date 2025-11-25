"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Minus,
  Eye,
  BarChart3,
  PieChart,
  Receipt,
  ExternalLink
} from 'lucide-react';

// Replace mock data with API calls
const { data } = await fetch('/api/wallet');

const mockWalletData = {
  balance: 45250.75,
  pendingBalance: 8420.50,
  totalEarnings: 127500.00,
  thisMonthEarnings: 12350.00,
  lastMonthEarnings: 10200.00,
  currency: 'ZAR'
};

const mockTransactions = [
  {
    id: '1',
    type: 'sale',
    orderNumber: 'ORD-241125-0123',
    description: 'Product Sale - Wireless Headphones',
    amount: 1299.00,
    fee: 64.95,
    net: 1234.05,
    status: 'completed',
    date: '2024-11-25T10:30:00',
    buyer: 'John Doe',
    paymentMethod: 'payfast'
  },
  {
    id: '2',
    type: 'sale',
    orderNumber: 'ORD-241124-0456',
    description: 'Product Sale - Laptop Stand',
    amount: 450.00,
    fee: 22.50,
    net: 427.50,
    status: 'completed',
    date: '2024-11-24T15:45:00',
    buyer: 'Jane Smith',
    paymentMethod: 'eft'
  },
  {
    id: '3',
    type: 'payout',
    description: 'Weekly Payout',
    amount: -5000.00,
    status: 'processing',
    date: '2024-11-23T09:00:00',
    payoutMethod: 'bank_transfer',
    referenceNumber: 'PO-241123-001'
  },
  {
    id: '4',
    type: 'refund',
    orderNumber: 'ORD-241120-0789',
    description: 'Refund - Damaged Item',
    amount: -899.00,
    status: 'completed',
    date: '2024-11-20T14:20:00',
    buyer: 'Mike Johnson'
  },
  {
    id: '5',
    type: 'sale',
    orderNumber: 'ORD-241119-0234',
    description: 'Product Sale - Smart Watch',
    amount: 2500.00,
    fee: 125.00,
    net: 2375.00,
    status: 'pending',
    date: '2024-11-19T11:15:00',
    buyer: 'Sarah Williams',
    paymentMethod: 'payfast'
  }
];

const mockPayoutHistory = [
  {
    id: '1',
    amount: 15000.00,
    status: 'completed',
    date: '2024-11-18T09:00:00',
    method: 'bank_transfer',
    reference: 'PO-241118-001',
    bankAccount: '****1234'
  },
  {
    id: '2',
    amount: 12500.00,
    status: 'completed',
    date: '2024-11-11T09:00:00',
    method: 'bank_transfer',
    reference: 'PO-241111-001',
    bankAccount: '****1234'
  }
];

export default function SellerWalletDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState(mockTransactions);
  const [walletData, setWalletData] = useState(mockWalletData);
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');

  // Calculate stats
  const completedTransactions = transactions.filter(t => t.status === 'completed' && t.type === 'sale');
  const totalSales = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = completedTransactions.reduce((sum, t) => sum + (t.fee || 0), 0);
  const averageOrderValue = completedTransactions.length > 0 ? totalSales / completedTransactions.length : 0;

  // Growth calculation
  const growthPercentage = walletData.lastMonthEarnings > 0
    ? ((walletData.thisMonthEarnings - walletData.lastMonthEarnings) / walletData.lastMonthEarnings) * 100
    : 0;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = transactionType === 'all' || t.type === transactionType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'payout':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-8 w-8 text-emerald-600" />
              Wallet & Earnings
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your earnings, transactions, and request payouts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(walletData.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Ready for payout</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Wallet className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(walletData.pendingBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Processing orders</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(walletData.thisMonthEarnings)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {growthPercentage >= 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">+{growthPercentage.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">{growthPercentage.toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(walletData.totalEarnings)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-xl font-bold">{formatCurrency(averageOrderValue)}</p>
                </div>
                <PieChart className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-bold">{completedTransactions.length}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                  <p className="text-xl font-bold">{formatCurrency(totalFees)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'transactions' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('transactions')}
                >
                  Transactions
                </Button>
                <Button
                  variant={activeTab === 'payouts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('payouts')}
                >
                  Payouts
                </Button>
              </div>

              {activeTab === 'transactions' && (
                <div className="flex gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white dark:bg-zinc-800"
                  >
                    <option value="all">All Types</option>
                    <option value="sale">Sales</option>
                    <option value="refund">Refunds</option>
                    <option value="payout">Payouts</option>
                  </select>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'sale' ? 'bg-green-100 dark:bg-green-900/30' :
                            transaction.type === 'refund' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.orderNumber} • {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Update Bank Details
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download Statement
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Receipt className="h-4 w-4 mr-2" />
                        View Tax Documents
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payout Schedule</h3>
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Weekly Payouts</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Next payout scheduled for Monday, 9:00 AM
                          </p>
                          <p className="text-sm font-semibold text-blue-600 mt-2">
                            Estimated: {formatCurrency(walletData.balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'sale' ? 'bg-green-100 dark:bg-green-900/30' :
                          transaction.type === 'refund' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {transaction.orderNumber && (
                              <span className="text-sm text-muted-foreground">
                                {transaction.orderNumber}
                              </span>
                            )}
                            {transaction.buyer && (
                              <span className="text-sm text-muted-foreground">
                                • {transaction.buyer}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:text-right">
                        <div>
                          <p className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.fee && (
                            <p className="text-xs text-muted-foreground">
                              Fee: -{formatCurrency(transaction.fee)}
                            </p>
                          )}
                          {transaction.net && (
                            <p className="text-xs font-medium">
                              Net: {formatCurrency(transaction.net)}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Request Payout</h3>
                      <p className="text-sm text-muted-foreground">
                        Available balance: {formatCurrency(walletData.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum payout: R 500.00
                      </p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Request
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Payout History</h3>
                  <div className="space-y-3">
                    {mockPayoutHistory.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">
                              {payout.reference} • {payout.bankAccount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(payout.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(payout.amount)}
                          </p>
                          <Badge className={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}