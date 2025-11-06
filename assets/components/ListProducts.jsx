"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Pencil, X, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "@/components/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

const ProductsTable = () => {
  const { data: session } = useSession();
  const profileImage = session?.user?.image;
  const profileName = session?.user?.name;
  const profileEmail = session?.user?.email;

  // Add this
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Fetch user products from API
    const fetchUserProducts = async (userId) => {
      if (!userId) {
        return;
      }

      try {
        const res = await fetch(`/api/products/user/${userId}`, {
          method: "GET",
        });

        if (res.status === 200) {
          const data = await res.json();
          setProducts(data);
          setLoading(false);
        }
      } catch (error) {
        // Handle fetch errors
        console.error(error);
      }
    };

    // Fetch user products when session data is available
    if (session?.user?.id) {
      fetchUserProducts(session.user.id);
    }
  }, [session]);

  // const products = [
  //   {
  //     id: 'PROD-8782',
  //     thumbnail: '/image.png',
  //     title: 'Product A',
  //     status: 'In Progress',
  //     priority: 'Medium',
  //   },
  //   {
  //     id: 'PROD-7878',
  //     thumbnail: '/image.png',
  //     title: 'Product B',
  //     status: 'Backlog',
  //     priority: 'Medium',
  //   },
  //   {
  //     id: 'PROD-7839',
  //     thumbnail: '/image.png',
  //     title: 'Product C',
  //     status: 'Todo',
  //     priority: 'High',
  //   },
  //   // Add more products as needed
  // ];

  const handleDeleteProduct = async (productId) => {
    // const confirmed = window.confirm(
    //   'Are you sure you want to delete this product?'
    // )

    // if (!confirmed) {
    //   return
    // }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        // Remove product from state
        const updatedProducts = products.filter(
          (product) => product._id !== productId,
        );
        setProducts(updatedProducts);

        toast({
          variant: "success",
          title: "Product Deleted",
          description: "Your product has been deleted successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete product",
          description:
            "Something went wrong. Please try again or contact site administrator.",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === "next") {
      setPage(page + 1);
    } else {
      setPage(page - 1);
    }
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
  };

  return (
    <Card className="w-11/12 mx-auto mt-10 dark:bg-zinc-900" data-oid="y.qvo25">
      <CardHeader className="flex flex-row" data-oid="-um8bbl">
        <CardTitle data-oid="54xqb8g">Products</CardTitle>
        <Link
          className="ml-auto"
          href="/dashboard/products/add"
          data-oid="9yen0nk"
        >
          <Button  data-oid="33:rv8u">
            <PlusCircle className="mr-2 h-4 w-4" data-oid="zdp2ibn" />
            Add Product
          </Button>
        </Link>
      </CardHeader>
      <CardContent data-oid="_9ki271">
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center pb-8"
            data-oid="i0:3k8i"
          >
            <p className="text-lg font-bold text-gray-500" data-oid="6o19spt">
              No products found
            </p>
            <p className="text-sm text-gray-400" data-oid="p98rra8">
              Add some products to get started
            </p>
          </div>
        ) : (
          <>
            <Table data-oid=":.b4-ri">
              <TableHeader data-oid="ieuas4-">
                <TableRow data-oid=".1nz.8s">
                  <TableHead data-oid="6y65aig">Image</TableHead>
                  <TableHead data-oid="d5k:nbm">Title</TableHead>
                  <TableHead data-oid="793-35s">Price</TableHead>
                  <TableHead data-oid="db_oo14">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-oid="w:-n4ga">
                {products
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                  .map((product) => (
                    <TableRow key={product.id} data-oid="8axeovt">
                      <TableCell data-oid="wka09v8">
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={100}
                          height={50}
                          className="w-18 h-16 object-cover rounded"
                          data-oid="b3fmpf7"
                        />
                      </TableCell>
                      <TableCell data-oid="2_as-cm">{product.title}</TableCell>
                      <TableCell data-oid="17l999y">{product.price}</TableCell>
                      <TableCell data-oid="cuz7eju">
                        {product.category}
                      </TableCell>
                      <TableCell data-oid="ep-_oqu">
                        <Link
                          href={`/dashboard/products/edit/${product._id}`}
                          data-oid="jdygsod"
                        >
                          <Button
                            className="mr-2"
                            variant="outline"
                            size="sm"
                            data-oid=".yv3q3d"
                          >
                            <Pencil
                              className="h-4 w-4"
                              data-oid="oz3-ukl"
                            />
                            
                          </Button>
                        </Link>
                        <AlertDialog data-oid="0roiuht">
                          <AlertDialogTrigger asChild data-oid="fn6h-8c">
                            <Button
                              variant="destructive"
                              size="sm"
                              data-oid="uvrhks0"
                            >
                              <X className="h-4 w-4" data-oid="8_9lp:x" />
                              
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-oid="7wc_k.6">
                            <AlertDialogHeader data-oid="10a04qt">
                              <AlertDialogTitle data-oid="jgnj8ay">
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription data-oid="y_4pfht">
                                This action cannot be undone. This will
                                permanently delete your product and remove your
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter data-oid="k4qa_4p">
                              <AlertDialogCancel data-oid="j_-kb5x">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction data-oid="_qd75uc">
                                <Button
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                  data-oid="4ce:oce"
                                >
                                  Continue
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div
              className="flex items-center justify-between mt-4"
              data-oid="lm3iczd"
            >
              <div className="flex items-center space-x-2" data-oid="yh8h945">
                <span data-oid="yf-e8_3">Rows per page:</span>
                <Select
                  onValueChange={handleRowsPerPageChange}
                  defaultValue={rowsPerPage.toString()}
                  data-oid="u:pqi4y"
                >
                  <SelectTrigger className="w-20" data-oid="o6bpkxk">
                    <SelectValue data-oid="o4_z3dc">{rowsPerPage}</SelectValue>
                  </SelectTrigger>
                  <SelectContent data-oid="ppedyrk">
                    <SelectItem value="5" data-oid="i881vp:">
                      5
                    </SelectItem>
                    <SelectItem value="10" data-oid="duckkbs">
                      10
                    </SelectItem>
                    <SelectItem value="20" data-oid="qneu0lm">
                      20
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2" data-oid="nx2b1ub">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange("prev")}
                  data-oid="kgyydm4"
                >
                  <ChevronLeft data-oid="1edntnp" />
                </Button>
                <span data-oid="phczq-z">Page {page} of 10</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 10}
                  onClick={() => handlePageChange("next")}
                  data-oid="rsiw4xn"
                >
                  <ChevronRight data-oid="l1wmxia" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
