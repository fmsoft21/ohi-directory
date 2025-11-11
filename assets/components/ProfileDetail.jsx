"use client";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/hooks/use-toast";

const ProfileDetail = () => {
  const { data: session } = useSession();
  // const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // email: session?.user?.email || '',
    phone: "",
    storename: "",
    address: "",
    country: "South Africa",
    city: "",
    province: "",
    zipCode: "",
    about: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          const data = await response.json();
          setFormData((prevState) => ({
            ...prevState,
            ...data,
          }));
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.storename) newErrors.storename = "Store name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.zipCode) newErrors.zipCode = "ZIP/Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "primary",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" data-oid="or.bs6i">
      <div className="flex items-center justify-between" data-oid="xdsbgcr">
        <h2 className="text-3xl font-bold" data-oid="3b6ykyh">
          Profile Settings
        </h2>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          data-oid="f6q.yc6"
        >
          Back
        </Button>
      </div>

      <div className="flex items-center justify-center mb-8" data-oid="2im9age">
        <div className="relative" data-oid="ona2zw.">
          <div
            className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center"
            data-oid="4lnew74"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                data-oid="irw6whl"
              />
            ) : (
              <span className="text-gray-400" data-oid="2:lnbah">
                avatar
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-0 right-0"
            data-oid="t51vqwm"
          >
            Change
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" data-oid="in.7z3j">
        <div className="grid grid-cols-2 gap-4" data-oid="weu165_">
          <div className="space-y-2" data-oid="y2j5f89">
            <label className="text-sm font-medium" data-oid="ftqhwl-">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange(e, "phone")}
              error={errors.phone}
              data-oid="bp91oeg"
            />

            {errors.phone && (
              <p className="text-sm text-red-500" data-oid="bhanjqq">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="ypwhqer">
            <label className="text-sm font-medium" data-oid="a7ygx-y">
              Store Name
            </label>
            <Input
              value={formData.storename}
              onChange={(e) => handleInputChange(e, "storename")}
              error={errors.storename}
              data-oid="ebhzmim"
            />

            {errors.phone && (
              <p className="text-sm text-red-500" data-oid="6uw7ow9">
                {errors.storename}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4" data-oid="rzlntc7">
          <div className="space-y-2" data-oid="m6iblab">
            <label className="text-sm font-medium" data-oid="_093muj">
              Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange(e, "address")}
              error={errors.address}
              data-oid="ifdwnrz"
            />

            {errors.address && (
              <p className="text-sm text-red-500" data-oid="pe2b.2c">
                {errors.address}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="axhux_i">
            <label className="text-sm font-medium" data-oid="266nh0b">
              Email
            </label>
            <Input value={session?.user?.email} disabled data-oid="cxdud2_" />
          </div>
        </div>

        <div className="space-y-2" data-oid="5dwdq1y">
          <label className="text-sm font-medium" data-oid="c.3e1nx">
            Country
          </label>
          <Input value={formData.country} disabled data-oid="zwiff0j" />
        </div>

        <div className="grid grid-cols-3 gap-4" data-oid="7krj0ta">
          <div className="space-y-2" data-oid="3af_ngb">
            <label className="text-sm font-medium" data-oid="-d1wju0">
              City
            </label>
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange(e, "city")}
              error={errors.city}
              data-oid="7_pdr.y"
            />

            {errors.city && (
              <p className="text-sm text-red-500" data-oid="f_hu:8x">
                {errors.city}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="ithw_i0">
            <label className="text-sm font-medium" data-oid=".imjbe0">
              Province
            </label>
            <Select
              value={formData.province}
              onValueChange={(value) =>
                setFormData({ ...formData, province: value })
              }
              data-oid="7cj5bx3"
            >
              <SelectTrigger data-oid="f765o6d">
                <SelectValue placeholder="Select province" data-oid="88.kjkb" />
              </SelectTrigger>
              <SelectContent data-oid="jbnchok">
                <SelectItem value="Gauteng" data-oid="1-fooqj">
                  Gauteng
                </SelectItem>
                <SelectItem value="Western Cape" data-oid="-n9:wk0">
                  Western Cape
                </SelectItem>
                <SelectItem value="KwaZulu Natal" data-oid="uufns4u">
                  KwaZulu-Natal
                </SelectItem>
                <SelectItem value="Northern Cape" data-oid="1u0h3tq">
                  Northern Cape
                </SelectItem>
                <SelectItem value="Mpumalanga" data-oid="hnh9kma">
                  Mpumalanga
                </SelectItem>
                <SelectItem value="Eastern Cape" data-oid="a38.7eo">
                  Eastern Cape
                </SelectItem>
                <SelectItem value="Free State" data-oid="pk9qwjw">
                  Free State
                </SelectItem>
                <SelectItem value="North West" data-oid="8uey347">
                  North West
                </SelectItem>
                <SelectItem value="Limpopo" data-oid="e29y0qh">
                  Limpopo
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.province && (
              <p className="text-sm text-red-500" data-oid="fqqxooo">
                {errors.province}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="um3lwvl">
            <label className="text-sm font-medium" data-oid="cb.yf-z">
              Postal Code
            </label>
            <Input
              value={formData.zipCode}
              onChange={(e) => handleInputChange(e, "zipCode")}
              error={errors.zipCode}
              data-oid="1guu.gw"
            />

            {errors.zipCode && (
              <p className="text-sm text-red-500" data-oid="_g-frvb">
                {errors.zipCode}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2" data-oid="l:2zg1f">
          <label className="text-sm font-medium" data-oid="6j1b97m">
            About
          </label>
          <Textarea
            value={formData.about}
            onChange={(e) => handleInputChange(e, "about")}
            placeholder="Let customers know more about your store"
            className="h-32"
            data-oid="9at6i.b"
          />
        </div>

        <div className="flex justify-end space-x-4" data-oid="p9pxtc6">
          <Button variant="outline" type="button" data-oid="bk13378">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} data-oid="a4g7rzy">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileDetail;
