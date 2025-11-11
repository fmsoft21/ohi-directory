"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { fetchProduct } from "@/assets/hooks/fetchProducts";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Edit2, PlusCircle, Upload, X } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";

// Importing UI components from a custom UI library
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploadCard from "./ImageUploadCard";

const EditProductForm = () => {
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  // Add state for tracking removed images
  const [removedImages, setRemovedImages] = useState([]);
  const { id } = useParams();
  const router = useRouter();

  const [fields, setFields] = useState({
    owner: "",
    title: "",
    description: "",
    price: 0,
    discountPercentage: 0,
    rating: 0,
    stock: 0,
    brand: "",
    category: "",
    status: "draft",
    deliveryOptions: {
      delivery: false,
      collection: false,
    },
    keywords: "",
    warranty: "",
    shippingOrigin: "",
    featured: "",
    thumbnail: "",
    images: [],
  });

  useEffect(() => {
    // Fetch product data using your fetchProduct function
    const fetchProductData = async () => {
      try {
        const productData = await fetchProduct(id);

        // Populate the fields state with the fetched data
        setFields(productData);
        setPreviewImage(productData.thumbnail);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, []);

  useEffect(() => {
    // Cleanup function for object URLs
    return () => {
      fields.images.forEach((img) => {
        if (img instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(img));
        }
      });
    };
  }, [fields.images]);

  const handleFieldChange = (field, value, index = null, action = "update") => {
    setFields((prev) => {
      if (field === "images") {
        const newImages = [...prev.images];
        if (action === "remove") {
          newImages.splice(index, 1);
        } else if (index !== null) {
          newImages[index] = value[0];
        } else {
          newImages.push(...value);
        }
        return { ...prev, images: newImages };
      }
      return { ...prev, [field]: value };
    });
  };
  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if nested property
    if (name.includes(".")) {
      const [outerKey, innerKey] = name.split(".");

      setFields((prevFields) => ({
        ...prevFields,
        [outerKey]: {
          ...prevFields[outerKey],
          [innerKey]: value,
        },
      }));
    } else {
      // Not nested
      setFields((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));
    }
  };
  // Handler for select input changes
  const handleSelectChange = (name, value) => {
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add handler for delivery options
  const handleDeliveryOptionsChange = (option, checked) => {
    setFields((prev) => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: checked,
      },
    }));
  };

  const handleRemoveImage = (imageUrl) => {
    setRemovedImages((prev) => [...prev, imageUrl]);
  };

  // Update handleSubmit to properly handle the image upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Add all non-file fields
      Object.keys(fields).forEach((key) => {
        if (key !== "images" && key !== "deliveryOptions") {
          formData.append(key, fields[key]);
        }
      });

      formData.append(
        "deliveryOptions",
        JSON.stringify(fields.deliveryOptions),
      );
      // Add removed images array
      formData.append("removedImages", JSON.stringify(removedImages));
      // Handle images - only append File objects
      fields.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const updatedProduct = await res.json();

      toast({
        variant: "success",
        title: "Product Updated",
        description: "Your product has been updated successfully.",
      });

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description:
          error.message || "Failed to update product. Please try again.",
      });
    }
  };

  // Update handleSubmit to match AddProductForm image processing
  // Add these functions after the handleImageChange function

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-oid="0g5lfck">
      <main
        className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
        data-oid="mtbs:iv"
      >
        <div
          className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4"
          data-oid=":lo-jck"
        >
          {/* Header section */}
          <div className="flex items-center gap-4" data-oid="mkbneya">
            <Link href="/dashboard/products" data-oid="xftav6m">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                data-oid="6yaoxyt"
              >
                <ChevronLeft className="h-4 w-4" data-oid="b_4i0vs" />
                <span className="sr-only" data-oid="zf81rpd">
                  Back
                </span>
              </Button>
            </Link>
            <h1
              className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0"
              data-oid="n1k61n4"
            >
              Edit Product - {fields.title}
            </h1>
            
            <div
              className="hidden items-center gap-2 md:ml-auto md:flex"
              data-oid="1ifcrm0"
            >
              <Link href="/dashboard/products">
              <Button variant="outline" size="sm" data-oid="hrrlpz6">
                Discard
              </Button>
              </Link>
              <Button type="submit" size="sm" data-oid="k:b5c-t">
                Update Product
              </Button>
            </div>
          </div>

          {/* Main content grid */}
          <div
            className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8"
            data-oid="ywzmf_8"
          >
            {/* Left column */}
            <div
              className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8"
              data-oid="ee03264"
            >
              {/* Product Details Card */}
              <Card data-oid="hgl4:m2">
                <CardHeader data-oid="s3tfmrn">
                  <CardTitle data-oid="t.n6qku">Product Details</CardTitle>
                  <CardDescription data-oid="h:47:iu">
                    Edit the details of your product
                  </CardDescription>
                </CardHeader>
                <CardContent data-oid="pwfvh7p">
                  <div className="grid gap-6" data-oid="blm92lp">
                    {/* Product name input */}
                    <div className="grid gap-3" data-oid="0bb53tv">
                      <Label htmlFor="name" data-oid="vg1sr3z">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        name="title"
                        className="w-full"
                        placeholder="Enter a name for your product"
                        value={fields.title}
                        onChange={handleChange}
                        data-oid="9x1.kze"
                      />
                    </div>
                    {/* Product description textarea */}
                    <div className="grid gap-3" data-oid="sj1u57l">
                      <Label htmlFor="description" data-oid="y66fwd6">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        className="min-h-32"
                        placeholder="Enter a brief description of the product features and any relevant information."
                        name="description"
                        value={fields.description}
                        onChange={handleChange}
                        data-oid="0vd3rcg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Category Card */}
              <Card data-oid="c.3delu">
                <CardHeader data-oid="fvok.o:">
                  <CardTitle data-oid="f:t8of6">Product Category</CardTitle>
                </CardHeader>
                <CardContent data-oid="o0d:.7r">
                  <div className="grid gap-6 sm:grid-cols-3" data-oid="515ayxa">
                    {/* Category select */}
                    <div className="grid gap-3" data-oid="65f_ijn">
                      <Label htmlFor="category" data-oid="_i9ks_6">
                        Category
                      </Label>
                      <Select
                        name="category"
                        value={fields.category}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                        data-oid="-viw3am"
                      >
                        <SelectTrigger id="category" data-oid="ufolcyo">
                          <SelectValue
                            placeholder="Select category"
                            data-oid="dndso2b"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="fiq6so:">
                          <SelectItem value="clothing" data-oid="n5e2doi">
                            Clothing
                          </SelectItem>
                          <SelectItem value="electronics" data-oid="yti.2xy">
                            Electronics
                          </SelectItem>
                          <SelectItem value="accessories" data-oid="n4:h9an">
                            Accessories
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Brand select */}
                    <div className="grid gap-3" data-oid="fa.t-iv">
                      <Label htmlFor="brand" data-oid="wdc3c-7">
                        Brand (optional)
                      </Label>
                      <Select
                        name="brand"
                        value={fields.brand}
                        onValueChange={(value) =>
                          handleSelectChange("brand", value)
                        }
                        data-oid="dyu.smg"
                      >
                        <SelectTrigger id="brand" data-oid="mtfeede">
                          <SelectValue
                            placeholder="Select brand"
                            data-oid="1ozoo5i"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="ntdyjqf">
                          <SelectItem value="brand1" data-oid="fugw_vg">
                            Brand 1
                          </SelectItem>
                          <SelectItem value="brand2" data-oid="5xry.f5">
                            Brand 2
                          </SelectItem>
                          <SelectItem value="brand3" data-oid="72ml:-v">
                            Brand 3
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Card */}
              <Card x-chunk="dashboard-07-chunk-1" data-oid="_qdvm__">
                <CardHeader data-oid="xk_gqtj">
                  <CardTitle data-oid=":g-ef56">Stock</CardTitle>
                  <CardDescription data-oid="c4w3d9n">
                    Lipsum dolor sit amet, consectetur adipiscing elit
                  </CardDescription>
                </CardHeader>
                <CardContent data-oid="ee51f7n">
                  <Table data-oid="27ikmwr">
                    <TableHeader data-oid="srx4_89">
                      <TableRow data-oid="_sy_1ag">
                        <TableHead data-oid="l1ng-u3">Stock</TableHead>
                        <TableHead data-oid="5-glmr1">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-oid="g52g8pq">
                      <TableRow data-oid="86zyl1j">
                        {/* Stock input */}
                        <TableCell data-oid="zycoosw">
                          <Label
                            htmlFor="stock-1"
                            className="sr-only"
                            data-oid="a05nl92"
                          >
                            Stock
                          </Label>
                          <Input
                            id="stock-1"
                            type="number"
                            name="stock"
                            placeholder="Enter number of items in stock"
                            value={fields.stock}
                            onChange={handleChange}
                            data-oid="rk5simd"
                          />
                        </TableCell>
                        {/* Price input */}
                        <TableCell data-oid="39-..ie">
                          <Label
                            htmlFor="price-1"
                            className="sr-only"
                            data-oid="0:qq:ue"
                          >
                            Price per product
                          </Label>
                          <Input
                            id="price-1"
                            type="number"
                            placeholder="Enter product price"
                            name="price"
                            value={fields.price}
                            onChange={handleChange}
                            data-oid="fk6cuoz"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Additional Product Details Card */}
              <Card data-oid="rg0rga-">
                <CardHeader data-oid="l8to-18">
                  <CardTitle data-oid="hljt7yx">
                    Additional Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent data-oid="e_4ioc:">
                  <div className="grid gap-6" data-oid="ut_8:-3">
                    {/* Keywords */}
                    <div className="grid gap-3" data-oid=":cmhesr">
                      <Label htmlFor="keywords" data-oid="v509qwr">
                        Keywords
                      </Label>
                      <Input
                        id="keywords"
                        type="text"
                        placeholder="What categroy or domain would you say your products belong to?"
                        name="keywords"
                        value={fields.keywords}
                        onChange={handleChange}
                        data-oid="e_ukqn1"
                      />
                    </div>

                    {/* Warranty */}
                    <div className="grid gap-3" data-oid="s2kjrqt">
                      <Label htmlFor="warranty" data-oid="k9.:z.q">
                        Warranty
                      </Label>
                      <Input
                        id="warranty"
                        type="text"
                        placeholder="Enter a warranty period, if applicable"
                        name="warranty"
                        value={fields.warranty}
                        onChange={handleChange}
                        data-oid="e5u:c-m"
                      />
                    </div>

                    {/* Shipping Origin */}
                    <div className="grid gap-3" data-oid="c.5sc-:">
                      <Label htmlFor="shipping-origin" data-oid=".qdkwmu">
                        Shipping Origin
                      </Label>
                      <Input
                        id="shipping-origin"
                        type="text"
                        placeholder="Where is this product shipped from?"
                        name="shippingOrigin"
                        value={fields.shippingOrigin}
                        onChange={handleChange}
                        data-oid="on2or3l"
                      />
                    </div>

                    {/* Featured */}
                    {/* <div className="grid gap-3">
                          <Label htmlFor="featured">Featured</Label>
                          <Input
                            id="featured"
                            type="text"
                            placeholder="Enter featured status or category"
                            name="featured"
                            value={fields.featured}
                            onChange={handleChange}
                          />
                         </div> */}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right column */}
            <div
              className="grid auto-rows-max items-start gap-4 lg:gap-8"
              data-oid="dvr5tz2"
            >
              {/* Product Status Card */}
              <Card x-chunk="dashboard-07-chunk-3" data-oid="16_:xqb">
                <CardHeader data-oid="slpj:q5">
                  <CardTitle data-oid="rkw6107">Product Status</CardTitle>
                </CardHeader>
                <CardContent data-oid="vy-ewg-">
                  <div className="grid gap-6" data-oid="oxjg-.6">
                    <div className="grid gap-3" data-oid="kmhxi:m">
                      <Label htmlFor="status" data-oid="8bvv79.">
                        Status
                      </Label>
                      <Select
                        name="status"
                        value={fields.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                        data-oid="y50hn_w"
                      >
                        <SelectTrigger data-oid="0_4cahv">
                          <SelectValue
                            placeholder="Select status"
                            data-oid="gm1nd.u"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="wk3m9mq">
                          <SelectItem value="draft" data-oid="y5jgu.2">
                            Draft
                          </SelectItem>
                          <SelectItem value="published" data-oid="j_az2re">
                            Active
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Images Card */}
              <ImageUploadCard
                images={fields.images}
                onChange={handleFieldChange}
                maxImages={5}
                onRemoveImage={handleRemoveImage}
                data-oid="eddtes0"
              />

              {/* <div className='space-y-4'> */}
              {/* Delivery Options Card */}
              <Card data-oid="szcazgk">
                <CardHeader data-oid="7fip7lz">
                  <CardTitle data-oid="pol2dhc">Delivery Options</CardTitle>
                </CardHeader>
                <CardContent data-oid="1nsob.f">
                  <div className="grid gap-6" data-oid="kec8ef-">
                    {/* Delivery Available Checkbox */}
                    <div
                      className="flex items-center space-x-2"
                      data-oid="_l770-2"
                    >
                      <Checkbox
                        id="delivery-available"
                        checked={fields.deliveryOptions.delivery}
                        onCheckedChange={(checked) =>
                          handleDeliveryOptionsChange("delivery", checked)
                        }
                        data-oid="gd3t96:"
                      />

                      <Label htmlFor="delivery-available" data-oid="im5696i">
                        Delivery Available
                      </Label>
                    </div>
                    {/* Collection Available Checkbox */}
                    <div
                      className="flex items-center space-x-2"
                      data-oid="jva-m6z"
                    >
                      <Checkbox
                        id="collection-available"
                        checked={fields.deliveryOptions.collection}
                        onCheckedChange={(checked) =>
                          handleDeliveryOptionsChange("collection", checked)
                        }
                        data-oid="d5:jbfc"
                      />

                      <Label htmlFor="collection-available" data-oid=":lbeq9-">
                        Collection Available
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* </div> */}
            </div>
          </div>
        </div>
      </main>
    </form>
  );
};

export default EditProductForm;
